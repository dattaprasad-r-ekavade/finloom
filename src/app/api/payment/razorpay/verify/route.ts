import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/apiAuth';
import { ErrorHandlers } from '@/lib/apiResponse';

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  challengeId?: string;
}

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  const expected = Buffer.from(expectedSignature, 'hex');
  const supplied = Buffer.from(signature, 'hex');
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.RELEASE_COMMERCE_ENABLED !== 'true') {
      return NextResponse.json({ error: 'Paid assessments are not enabled for this deployment.' }, { status: 503 });
    }

    const session = await requireRole(request, 'TRADER');
    if (!session) {
      return ErrorHandlers.unauthorized('Trader authentication required.');
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured.' },
        { status: 503 }
      );
    }

    let body: VerifyBody;
    try {
      body = (await request.json()) as VerifyBody;
    } catch {
      return ErrorHandlers.badRequest('A valid payment confirmation is required.');
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, challengeId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !challengeId) {
      return ErrorHandlers.badRequest('Missing required payment verification fields.');
    }

    // Verify HMAC-SHA256 signature
    const isValid = verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      console.warn('Razorpay signature verification failed for order:', razorpay_order_id);
      return NextResponse.json(
        { error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }

    const order = await prisma.challengeOrder.findFirst({
      where: { razorpayOrderId: razorpay_order_id, userId: session.userId },
      include: { challenge: { include: { plan: true } } },
    });

    if (!order || (challengeId && challengeId !== order.challengeId)) {
      return NextResponse.json(
        { error: 'Payment order not found for this account.' },
        { status: 404 },
      );
    }

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: keySecret });
    const providerPayment = await razorpay.payments.fetch(razorpay_payment_id);
    if (
      providerPayment.order_id !== razorpay_order_id ||
      providerPayment.status !== 'captured' ||
      providerPayment.amount !== order.amount ||
      providerPayment.currency !== order.currency
    ) {
      return NextResponse.json(
        { error: 'Payment is not captured for the expected order amount and currency.' },
        { status: 400 },
      );
    }

    if (order.status === 'PAID') {
      const existingPayment = await prisma.mockedPayment.findUnique({
        where: { razorpayPaymentId: razorpay_payment_id },
      });
      if (existingPayment?.razorpayOrderId === razorpay_order_id) {
        return NextResponse.json({ message: 'Payment already recorded.', payment: existingPayment, challengeId: order.challengeId });
      }
      return ErrorHandlers.conflict('This payment order has already been completed.');
    }

    if (order.challenge.status !== 'PENDING' || order.challenge.plan.fee * 100 !== order.amount) {
      return ErrorHandlers.conflict('The challenge or price changed. Please contact support.');
    }

    const result = await prisma.$transaction(async (transaction) => {
      const claimed = await transaction.challengeOrder.updateMany({
        where: { id: order.id, userId: session.userId, status: 'PENDING' },
        data: { status: 'PAID', paidAt: new Date() },
      });
      if (claimed.count !== 1) {
        throw new Error('ORDER_ALREADY_PROCESSED');
      }

      const payment = await transaction.mockedPayment.create({
        data: {
          userId: session.userId,
          challengeId: order.challengeId,
          amount: order.challenge.plan.fee,
          status: 'SUCCESS',
          mockTransactionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });
      const activation = await transaction.userChallenge.updateMany({
        where: { id: order.challengeId, userId: session.userId, status: 'PENDING' },
        data: { status: 'ACTIVE', startDate: new Date() },
      });
      if (activation.count !== 1) {
        throw new Error('CHALLENGE_ALREADY_PROCESSED');
      }

      const challenge = await transaction.userChallenge.findUnique({
        where: { id: order.challengeId },
        include: { plan: true },
      });
      return { payment, challenge };
    });

    return NextResponse.json({
      message: 'Payment verified. Challenge activated.',
      payment: result.payment,
      challenge: result.challenge,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'ORDER_ALREADY_PROCESSED' || error.message === 'CHALLENGE_ALREADY_PROCESSED')) {
      return ErrorHandlers.conflict('Payment confirmation is already being processed. Refresh the challenge before retrying.');
    }
    console.error('Razorpay verify error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
