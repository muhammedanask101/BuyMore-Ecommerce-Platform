import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation';
import { sendInvoiceEmail } from '@/lib/email/sendInvoiceEmail';

export async function POST(req: Request) {
  await connectDB();

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const order = await Order.findOne({
    paymentIntentId: razorpay_order_id,
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  order.status = 'paid';
  order.paidAt = new Date();
  await sendOrderConfirmationEmail(order, order.shippingAddress.email);
  await sendInvoiceEmail(order, order.shippingAddress.email);

  await order.save();

  return NextResponse.json({ success: true });
}
