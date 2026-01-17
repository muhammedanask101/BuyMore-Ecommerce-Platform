import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
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
    const reason = formData.get('reason')?.toString() ?? 'User requested refund';

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }

    const order = await Order.findOne({
      _id: orderId,
      guestId,
    });

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
       PAID / PROCESSING → REFUND REQUEST
    =========================== */

    if (order.status !== 'paid' && order.status !== 'processing') {
      throw new Error('Order cannot be refunded at this stage');
    }

    // Safety: no refund requests for delivered COD orders
    if (order.paymentProvider === 'cod' && order.status === 'processing') {
      throw new Error('COD orders cannot be refunded after dispatch');
    }

    // Prevent duplicate requests
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
      {
        error: error instanceof Error ? error.message : 'Failed to request refund',
      },
      { status: 400 }
    );
  }
}
