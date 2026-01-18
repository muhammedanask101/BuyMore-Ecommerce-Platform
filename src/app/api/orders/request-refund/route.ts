import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { restoreStock } from '@/lib/orders/restoreStock';
import { cookies } from 'next/headers';

/* ===========================
   REQUEST REFUND / CANCEL (USER)
=========================== */

export async function POST(req: Request) {
  await connectDB();

  try {
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) {
      throw new Error('Unauthorized');
    }

    const formData = await req.formData();
    const orderId = formData.get('orderId')?.toString();
    const reason = formData.get('reason')?.toString() ?? 'User requested cancellation';

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }

    const order = await Order.findOne({ _id: orderId, guestId });

    if (!order) {
      throw new Error('Order not found');
    }

    /* ===========================
       UNPAID → CANCEL
    =========================== */

    if (order.status === 'pending_payment') {
      order.status = 'cancelled';
      order.cancelReason = reason;
      order.cancelledAt = new Date();

      await order.save();
      return NextResponse.redirect(new URL(`/order/${order._id}`, req.url));
    }

    /* ===========================
       COD → CANCEL ONLY + STOCK RESTORE
    =========================== */

    if (order.paymentProvider === 'cod') {
      if (order.status === 'processing') {
        if (!order.stockRestored) {
          await restoreStock(order); // ✅ FIXED
          order.stockRestored = true;
        }

        order.status = 'cancelled';
        order.cancelReason = reason;
        order.cancelledAt = new Date();

        await order.save();

        await PaymentLog.create({
          orderId: order._id,
          provider: 'cod',
          event: 'order_cancelled',
          metadata: { reason },
        });

        return NextResponse.redirect(new URL(`/order/${order._id}`, req.url));
      }

      throw new Error('COD orders cannot be cancelled at this stage');
    }

    /* ===========================
       ONLINE PAYMENT → REFUND REQUEST
    =========================== */

    if (order.status !== 'paid' && order.status !== 'processing') {
      throw new Error('Order cannot be refunded at this stage');
    }

    if (order.status === 'refund_pending') {
      throw new Error('Refund already requested');
    }

    order.status = 'refund_pending';
    order.cancelReason = reason;

    await order.save();

    await PaymentLog.create({
      orderId: order._id,
      provider: order.paymentProvider,
      event: 'refund_requested',
      amount: order.total,
    });

    return NextResponse.redirect(new URL(`/order/${order._id}`, req.url));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 400 }
    );
  }
}
