import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export const runtime = 'nodejs'; // IMPORTANT (no edge)

export async function POST(req: Request) {
  await connectDB();

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // 🔒 Read RAW body
  const rawBody = await req.text();

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // ✅ Signature verified — now parse JSON
  const event = JSON.parse(rawBody);

  const eventType = event.event;

  /* ===========================
     HANDLE EVENTS
  ============================ */

  if (eventType === 'payment.captured') {
    const payment = event.payload.payment.entity;

    // receipt contains orderId
    const receipt = payment.notes?.receipt || payment.order_id;

    const order = await Order.findOne({
      paymentIntentId: payment.order_id,
    });

    if (order && order.status !== 'paid') {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();
    }
  }

  if (eventType === 'payment.failed') {
    const payment = event.payload.payment.entity;

    const order = await Order.findOne({
      paymentIntentId: payment.order_id,
    });

    if (order && order.status === 'pending_payment') {
      order.status = 'pending_payment'; // keep pending, allow retry
      await order.save();
    }
  }

  return NextResponse.json({ received: true });
}
