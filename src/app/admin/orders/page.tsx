import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type AdminOrderRow = {
  _id: string;
  total: number;
  currency: string;
  status: string;
  paymentProvider?: string | null;
  createdAt: Date;
};

export default async function AdminOrdersPage() {
  await connectDB();

  const orders = (await Order.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .select('_id total currency status paymentProvider createdAt')
    .lean()) as AdminOrderRow[];

  return (
    <div className="space-y-6">
      {/* ===========================
         HEADER
      =========================== */}
      <section className="border-4 border-black bg-white p-6">
        <h1 className="text-3xl font-extrabold">Orders</h1>
        <p className="mt-1 text-sm opacity-70">Recent customer orders (latest first)</p>
      </section>

      {/* ===========================
         ORDERS TABLE
      =========================== */}
      <section className="border-4 border-black bg-white overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b-4 border-black">
            <tr className="text-left text-sm uppercase tracking-wide">
              <th className="p-3">Order</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm opacity-60">
                  No orders found
                </td>
              </tr>
            )}

            {orders.map((order) => (
              <tr key={order._id.toString()} className="border-b">
                {/* ORDER ID */}
                <td className="p-3">
                  <Link href={`/admin/orders/${order._id}`} className="underline font-medium">
                    #{order._id.toString().slice(-6)}
                  </Link>
                </td>

                {/* PAYMENT PROVIDER */}
                <td className="p-3 capitalize">{order.paymentProvider ?? '—'}</td>

                {/* STATUS */}
                <td className="p-3 capitalize">
                  {order.status === 'refund_pending' ? (
                    <span className="text-red-600 font-bold">Refund requested</span>
                  ) : order.status === 'pending_payment' ? (
                    <span className="text-orange-600 font-medium">Pending payment</span>
                  ) : order.status === 'paid' ? (
                    <span className="text-green-700 font-medium">Paid</span>
                  ) : (
                    order.status
                  )}
                </td>

                {/* TOTAL */}
                <td className="p-3 font-medium">₹{order.total}</td>

                {/* DATE */}
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
