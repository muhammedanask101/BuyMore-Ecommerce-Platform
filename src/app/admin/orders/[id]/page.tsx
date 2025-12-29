import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import type { OrderDTO } from '@/types/order';

export const dynamic = 'force-dynamic';

type Props = {
  params: { orderId: string };
};

export default async function AdminOrderDetailPage({ params }: Props) {
  await connectDB();

  const order = await Order.findById(params.orderId).lean<OrderDTO>();

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <section className="border-4 border-black bg-white p-6">
        <h1 className="text-2xl font-extrabold">Order #{order._id.toString()}</h1>
        <p className="text-sm opacity-70 mt-1">
          Created {new Date(order.createdAt).toLocaleString()}
        </p>
      </section>

      {/* ORDER META */}
      <section className="border-4 border-black bg-white p-6 space-y-2">
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment:</strong> {order.paymentProvider}
        </p>
        <p>
          <strong>Total:</strong> ₹{order.total}
        </p>

        {order.paymentProvider === 'cod' && (
          <p>
            <strong>COD Verified:</strong> {order.codVerified ? 'Yes' : 'No'}
          </p>
        )}
      </section>

      {/* ITEMS */}
      <section className="border-4 border-black bg-white p-6">
        <h2 className="font-extrabold mb-4">Items</h2>

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.productId.toString()} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
                {item.size ? ` (${item.size})` : ''}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIONS */}
      <section className="border-4 border-black bg-white p-6">
        <h2 className="font-extrabold mb-4">Update Status</h2>

        <form
          action={`/api/admin/orders/${order._id}`}
          method="POST"
          className="flex gap-3 flex-wrap"
        >
          <select
            name="status"
            defaultValue={order.status}
            className="border-2 border-black px-4 py-2"
          >
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="submit"
            className="border-2 border-black px-6 py-2 bg-black text-white hover:bg-white hover:text-black transition"
          >
            Update
          </button>
        </form>

        <form action={`/api/admin/orders/${order._id}/invoice`} method="POST">
          <button className="border-2 border-black px-4 py-2 bg-white hover:bg-black hover:text-white transition">
            Resend Invoice
          </button>
        </form>
      </section>
    </div>
  );
}
