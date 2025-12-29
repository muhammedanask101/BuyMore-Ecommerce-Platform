import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

const COD_TIMEOUT_HOURS = 48;

export async function rollbackExpiredCodOrders() {
  await connectDB();

  const expiry = new Date(Date.now() - COD_TIMEOUT_HOURS * 60 * 60 * 1000);

  const expiredOrders = await Order.find({
    paymentProvider: 'cod',
    status: 'processing',
    createdAt: { $lt: expiry },
  });

  for (const order of expiredOrders) {
    for (const item of order.items) {
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    }

    order.status = 'cancelled';
    order.cancelReason = 'cod_timeout';
    order.cancelledAt = new Date();

    await order.save();
  }

  return { cancelled: expiredOrders.length };
}
