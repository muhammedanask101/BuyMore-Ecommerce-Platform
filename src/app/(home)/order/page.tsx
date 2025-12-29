import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

type OrderListItem = {
  _id: string;
  total: number;
  currency: string;
  status: string;
  createdAt: Date;
};

export default async function OrdersPage() {
  await connectDB();

  const cookieStore = await cookies();
  const guestId = cookieStore.get('guest_id')?.value;

  if (!guestId) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
        <p className="text-sm text-gray-600">No orders found on this device.</p>
      </main>
    );
  }

  const orders = (await Order.find({ guestId })
    .sort({ createdAt: -1 })
    .select('_id total currency status createdAt')
    .lean()) as OrderListItem[];

  if (orders.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
        <p className="text-sm text-gray-600">You haven’t placed any orders yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <a
            key={order._id}
            href={`/order/${order._id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Order #{order._id.slice(-6)}</p>
                <p className="text-sm text-gray-600">{order.createdAt.toLocaleDateString()}</p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  {order.currency} {order.total}
                </p>
                <p className="text-sm capitalize text-gray-600">{order.status}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
