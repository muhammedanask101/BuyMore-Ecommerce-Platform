import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { restoreStock } from '@/lib/orders/restoreStock';

/* ===========================
   ADMIN APPROVE REFUND
=========================== */

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    /* ===========================
       LOAD ORDER
    =========================== */

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'refund_pending') {
      throw new Error('Order is not eligible for refund');
    }

    /* ===========================
       RESTORE STOCK
    =========================== */

    await restoreStock(order.toObject(), session);

    /* ===========================
       MOCK PAYMENT REFUND
       (REAL GATEWAY LATER)
    =========================== */

    await PaymentLog.create(
      [
        {
          orderId: order._id,
          provider: order.paymentProvider,
          event: 'refund',
          amount: order.total,
        },
      ],
      { session }
    );

    /* ===========================
       UPDATE ORDER
    =========================== */

    order.status = 'refunded';
    order.refundedAt = new Date();

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: 'Refund approved and stock restored',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('ADMIN REFUND ERROR:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Refund failed',
      },
      { status: 400 }
    );
  }
}
