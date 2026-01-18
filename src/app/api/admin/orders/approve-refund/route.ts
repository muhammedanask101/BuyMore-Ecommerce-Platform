import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { restoreStock } from '@/lib/orders/restoreStock';

/* ===========================
   APPROVE REFUND (ADMIN)
=========================== */

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formData = await req.formData();
    const orderId = formData.get('orderId')?.toString();

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }

    /* ===========================
       LOAD ORDER (NO MUTATION)
    =========================== */

    const order = await Order.findById(orderId).session(session);

    if (!order || order.status !== 'refund_pending') {
      throw new Error('Order not eligible for refund');
    }

    /* ===========================
       🚫 COD REFUND BLOCK (CORRECT PLACE)
    =========================== */

    if (order.paymentProvider === 'cod') {
      throw new Error('COD orders cannot be refunded');
    }

    /* ===========================
       APPLY REFUND TRANSITION
    =========================== */

    order.status = 'refunded';
    order.refundedAt = new Date();
    await order.save({ session });

    /* ===========================
       RESTORE STOCK
    =========================== */

    if (!order.stockRestored) {
      await restoreStock(order, session);
      order.stockRestored = true;
    }
    /* ===========================
       PAYMENT LOG
    =========================== */

    await PaymentLog.create(
      [
        {
          orderId: order._id,
          provider: order.paymentProvider,
          event: 'refund_approved',
          amount: order.total,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.redirect(new URL(`/admin/orders/${order._id}`, req.url));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Refund approval failed',
      },
      { status: 400 }
    );
  }
}
