import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { normalizeIndianPhone } from '@/lib/utils/phone';

/* ===========================
   HELPERS
=========================== */

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/* ===========================
   VERIFY COD OTP (DELIVERY)
=========================== */

export async function POST(req: Request) {
  await connectDB();

  try {
    const { orderId, otp, phone } = await req.json();

    /* ===========================
       BASIC VALIDATION
    =========================== */

    if (!orderId || !otp || !phone) {
      return NextResponse.json({ error: 'orderId, otp and phone are required' }, { status: 400 });
    }

    const normalizedPhone = normalizeIndianPhone(phone);

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentProvider !== 'cod') {
      return NextResponse.json({ error: 'Not a COD order' }, { status: 400 });
    }

    /* ===========================
       PHONE MATCH (DELIVERY SAFETY)
    =========================== */

    const orderPhone = normalizeIndianPhone(order.contact.phone);

    if (orderPhone !== normalizedPhone) {
      return NextResponse.json({ error: 'Phone number mismatch' }, { status: 400 });
    }

    /* ===========================
       STATE SAFETY
    =========================== */

    if (order.codVerified) {
      return NextResponse.json({ success: true });
    }

    if (!order.codOtp || !order.codOtpExpiresAt) {
      return NextResponse.json({ error: 'OTP not generated' }, { status: 400 });
    }

    if (order.codOtpExpiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    /* ===========================
       OTP CHECK
    =========================== */

    const hashedInput = hashOtp(otp);

    if (order.codOtp !== hashedInput) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    /* ===========================
       MARK COD AS VERIFIED
    =========================== */

    order.codVerified = true;
    order.codOtp = undefined;
    order.codOtpExpiresAt = undefined;

    await order.save();

    /* ===========================
       PAYMENT LOG
    =========================== */

    await PaymentLog.create({
      orderId: order._id,
      provider: 'cod',
      event: 'cod_verified',
      amount: order.total,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'COD OTP verification failed',
      },
      { status: 500 }
    );
  }
}
