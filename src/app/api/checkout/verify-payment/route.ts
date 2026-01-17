import { NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { paymentProvider } from '@/lib/payments';

const VerifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { orderId, paymentId, signature } = parsed.data;

    await connectDB();

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({ ok: true });
    }

    const isValid = await paymentProvider.verifyPayment({
      orderId: order.paymentOrderId!,
      paymentId,
      signature: signature || '',
    });

    if (!isValid) {
      order.status = 'payment_failed';
      await order.save();

      await PaymentLog.create({
        orderId: order._id,
        provider: order.paymentProvider,
        event: 'failed',
        amount: order.total,
      });

      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    order.status = 'paid';
    order.paidAt = new Date();
    order.paymentPaymentId = paymentId;

    await order.save();

    await PaymentLog.create({
      orderId: order._id,
      provider: order.paymentProvider,
      event: 'success',
      amount: order.total,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('VERIFY PAYMENT ERROR', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
