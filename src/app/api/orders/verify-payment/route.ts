import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw new Error('Invalid order ID');
    }

    /* ===========================
       FETCH ORDER (LOCKED)
    =========================== */

    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw new Error('Order not found');
    }

    /* ===========================
       IDEMPOTENCY
    =========================== */

    if (order.status === 'paid') {
      // Already paid → safe retry
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        success: true,
        status: 'already_paid',
      });
    }

    if (order.status !== 'pending_payment') {
      throw new Error(`Order cannot be paid in status: ${order.status}`);
    }

    if (order.paymentProvider !== 'razorpay') {
      throw new Error('Invalid payment provider for verification');
    }

    /* ===========================
       MOCK PAYMENT VERIFICATION
       (REAL RAZORPAY LATER)
    =========================== */

    // 🔒 Later: verify Razorpay signature here

    /* ===========================
       UPDATE ORDER
    =========================== */

    order.status = 'paid';
    order.paidAt = new Date();

    await order.save({ session });

    /* ===========================
       PAYMENT LOG
    =========================== */

    await PaymentLog.create(
      [
        {
          orderId: order._id,
          provider: 'razorpay',
          event: 'success',
          amount: order.total,
          currency: order.currency,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      status: 'paid',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Payment verification failed',
      },
      { status: 400 }
    );
  }
}
