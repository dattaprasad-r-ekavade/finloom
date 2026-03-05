import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/apiAuth';
import { ErrorHandlers } from '@/lib/apiResponse';

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  challengeId: string;
}

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
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

    const body = (await request.json()) as VerifyBody;
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

    // Ensure challenge belongs to this user and is still PENDING
    const challenge = await prisma.userChallenge.findFirst({
      where: { id: challengeId, userId: session.userId, status: 'PENDING' },
      include: { plan: true },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found or already activated.' },
        { status: 404 }
      );
    }

    // Check if payment already recorded (idempotency)
    const existingPayment = await prisma.mockedPayment.findFirst({
      where: { challengeId, razorpayOrderId: razorpay_order_id },
    });

    if (existingPayment) {
      return NextResponse.json({
        message: 'Payment already recorded.',
        payment: existingPayment,
        challengeId,
      });
    }

    // Record payment and activate challenge in a transaction
    const [payment, updatedChallenge] = await prisma.$transaction([
      prisma.mockedPayment.create({
        data: {
          userId: session.userId,
          challengeId,
          amount: challenge.plan.fee,
          status: 'SUCCESS',
          mockTransactionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }),
      prisma.userChallenge.update({
        where: { id: challengeId },
        data: {
          status: 'ACTIVE',
          startDate: new Date(),
        },
        include: { plan: true },
      }),
    ]);

    return NextResponse.json({
      message: 'Payment verified. Challenge activated.',
      payment,
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
