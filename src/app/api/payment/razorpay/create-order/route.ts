import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/apiAuth';
import { ErrorHandlers } from '@/lib/apiResponse';

interface CreateOrderBody {
  planId?: string;
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

    let body: CreateOrderBody;
    try {
      body = (await request.json()) as CreateOrderBody;
    } catch {
      return ErrorHandlers.badRequest('A valid payment request is required.');
    }

    const requestedPlanId = typeof body.planId === 'string' ? body.planId.trim() : '';
    if (!requestedPlanId) {
      return ErrorHandlers.badRequest('A challenge plan is required.');
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Verify KYC is approved
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { mockedKyc: true },
    });

    if (!user) {
      return ErrorHandlers.notFound('User not found.');
    }

    if (!user.mockedKyc || !['APPROVED', 'AUTO_APPROVED'].includes(user.mockedKyc.status)) {
      return NextResponse.json(
        { error: 'KYC must be approved before processing payment.' },
        { status: 403 }
      );
    }

    // Get the user's PENDING challenge
    const challenge = await prisma.userChallenge.findFirst({
      where: {
        userId: session.userId,
        status: 'PENDING',
        ...(requestedPlanId ? { planId: requestedPlanId } : {}),
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'No pending challenge reservation found. Please select a challenge plan first.' },
        { status: 404 }
      );
    }

    // Amount in paise (INR × 100)
    const amountInPaise = challenge.plan.fee * 100;

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `challenge_${challenge.id.slice(-8)}`,
      notes: {
        challengeId: challenge.id,
        planName: challenge.plan.name,
        userId: session.userId,
      },
    });

    await prisma.challengeOrder.create({
      data: {
        userId: session.userId,
        challengeId: challenge.id,
        razorpayOrderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      challengeId: challenge.id,
      planName: challenge.plan.name,
      keyId,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return NextResponse.json(
      { error: 'Unable to create payment order. Please try again.' },
      { status: 500 }
    );
  }
}
