import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  await connectDB();

  const orders = await Order.find().sort({ createdAt: -1 }).limit(50).lean();

  return (
    <div className="space-y-6">
      <section className="border-4 border-black bg-white p-6">
        <h1 className="text-3xl font-extrabold">Orders</h1>
        <p className="mt-1 text-sm opacity-70">Recent customer orders</p>
      </section>

      <section className="border-4 border-black bg-white overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b-4 border-black">
            <tr className="text-left">
              <th className="p-3">Order</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id.toString()} className="border-b">
                <td className="p-3">
                  <Link href={`/admin/orders/${order._id}`} className="underline font-medium">
                    #{order._id.toString().slice(-6)}
                  </Link>
                </td>

                <td className="p-3 capitalize">{order.paymentProvider ?? '—'}</td>

                <td className="p-3 capitalize">{order.status}</td>

                <td className="p-3">₹{order.total}</td>

                <td className="p-3 text-sm opacity-70">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
