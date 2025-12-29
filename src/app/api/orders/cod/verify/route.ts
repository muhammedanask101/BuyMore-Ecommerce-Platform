import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(req: Request) {
  await connectDB();

  const { orderId, otp } = await req.json();

  if (!orderId || !otp) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const order = await Order.findById(orderId);

  if (!order || order.paymentProvider !== 'cod') {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.codVerified) {
    return NextResponse.json({ success: true });
  }

  if (!order.codOtp || !order.codOtpExpiresAt) {
    return NextResponse.json({ error: 'OTP not available' }, { status: 400 });
  }

  if (order.codOtpExpiresAt < new Date()) {
    return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
  }

  if (order.codOtp !== hashOtp(otp)) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  order.codVerified = true;
  order.codOtp = undefined;
  order.codOtpExpiresAt = undefined;

  await order.save();

  return NextResponse.json({ success: true });
}
