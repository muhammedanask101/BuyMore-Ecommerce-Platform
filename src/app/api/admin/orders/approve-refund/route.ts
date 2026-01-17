import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import PaymentLog from '@/models/PaymentLog';

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
       ATOMIC REFUND TRANSITION
    =========================== */

    const order = await Order.findOneAndUpdate(
      { _id: orderId, status: 'refund_pending' },
      { status: 'refunded', refundedAt: new Date() },
      { session, new: true }
    );

    if (!order) {
      throw new Error('Order not eligible for refund');
    }

    /* ===========================
       RESTORE STOCK
    =========================== */

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    /* ===========================
       PAYMENT LOG
    =========================== */

    if (order.paymentProvider !== 'cod') {
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
    }

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
