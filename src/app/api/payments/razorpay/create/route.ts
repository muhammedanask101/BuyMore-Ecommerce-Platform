import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  await connectDB();

  const { orderId } = await req.json();

  const order = await Order.findById(orderId);

  if (!order || order.status !== 'pending') {
    return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: order.total * 100, // paise
    currency: order.currency ?? 'INR',
    receipt: order._id.toString(),
  });

  order.paymentProvider = 'razorpay';
  order.paymentIntentId = razorpayOrder.id;
  await order.save();

  return NextResponse.json({
    razorpayOrderId: razorpayOrder.id,
    key: process.env.RAZORPAY_KEY_ID,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  });
}
