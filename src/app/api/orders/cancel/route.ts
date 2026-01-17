import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import PaymentLog from '@/models/PaymentLog';

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const formData = await req.formData();
    const orderId = formData.get('orderId')?.toString();

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    /* ===========================
       AUTH: GUEST OWNERSHIP
    =========================== */

    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) {
      throw new Error('Unauthorized');
    }

    const order = await Order.findOne({
      _id: orderId,
      guestId,
    }).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    /* ===========================
       STATUS VALIDATION
    =========================== */

    if (!['pending_payment', 'processing'].includes(order.status)) {
      throw new Error('Order cannot be cancelled');
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
       UPDATE ORDER
    =========================== */

    order.status = 'cancelled';
    order.cancelledAt = new Date();

    await order.save({ session });

    /* ===========================
       LOG EVENT (REFUND HOOK)
    =========================== */

    await PaymentLog.create(
      [
        {
          orderId: order._id,
          provider: order.paymentProvider,
          event: 'cancelled',
          amount: order.total,
          currency: order.currency,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.redirect(new URL(`/order/${order._id.toString()}`, req.url));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Cancel failed',
      },
      { status: 400 }
    );
  }
}
