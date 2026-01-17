import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* ===========================
       IDEMPOTENCY GUARD
    =========================== */
    if (order.status === 'paid' || order.status === 'processing') {
      return NextResponse.json({ success: true });
    }

    /* ===========================
       MARK PAYMENT SUCCESS
    =========================== */

    order.status = 'processing'; // ✅ move to fulfilment stage
    order.paidAt = new Date();

    await order.save();

    /* ===========================
       PAYMENT LOG
    =========================== */

    await PaymentLog.create({
      orderId: order._id,
      provider: order.paymentProvider,
      event: 'success',
      amount: order.total,
      currency: order.currency,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('VERIFY PAYMENT ERROR:', error);

    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
