import mongoose from 'mongoose';
import Product from '@/models/Product';
import type { OrderDTO } from '@/types/order';

export async function restoreStock(order: OrderDTO, session: mongoose.ClientSession) {
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: item.quantity } },
      { session }
    );
  }
}
