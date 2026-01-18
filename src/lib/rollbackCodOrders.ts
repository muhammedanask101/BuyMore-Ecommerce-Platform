import connectDB from '@/lib/db';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { restoreStock } from '@/lib/orders/restoreStock';

const COD_TIMEOUT_HOURS = 48;

/* ===========================
   ROLLBACK EXPIRED COD ORDERS
=========================== */

export async function rollbackExpiredCodOrders() {
  await connectDB();

  const expiry = new Date(Date.now() - COD_TIMEOUT_HOURS * 60 * 60 * 1000);

  const expiredOrders = await Order.find({
    paymentProvider: 'cod',
    status: 'processing',
    createdAt: { $lt: expiry },
  });

  for (const order of expiredOrders) {
    if (!order.stockRestored) {
      await restoreStock(order); // ✅ FIXED
      order.stockRestored = true;
    }

    order.status = 'cancelled';
    order.cancelReason = 'cod_timeout';
    order.cancelledAt = new Date();

    await order.save();

    await PaymentLog.create({
      orderId: order._id,
      provider: 'cod',
      event: 'order_cancelled',
      metadata: { reason: 'cod_timeout' },
    });
  }

  return { cancelled: expiredOrders.length };
}
