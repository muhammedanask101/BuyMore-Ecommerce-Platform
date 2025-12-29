import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

const PAYMENT_TIMEOUT_MINUTES = 30;

export async function rollbackExpiredPendingOrders() {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expiryDate = new Date(Date.now() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    const expiredOrders = await Order.find({
      status: 'pending',
      paidAt: null, // 🔒 extra safety
      createdAt: { $lt: expiryDate },
    }).session(session);

    for (const order of expiredOrders) {
      // 🔁 Restore stock
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
          { session }
        );
      }

      // ❌ Cancel order
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancelReason = 'payment_timeout';

      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      rolledBack: expiredOrders.length,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
