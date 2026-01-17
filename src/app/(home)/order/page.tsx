import { cookies } from 'next/headers';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

type OrderListItem = {
  _id: string;
  total: number;
  currency: string;
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: Date;
};

/* ===========================
   STATUS LABELS (USER FRIENDLY)
=========================== */

const STATUS_LABELS: Record<OrderListItem['status'], string> = {
  pending_payment: 'Awaiting payment',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export default async function OrdersPage() {
  await connectDB();

  const cookieStore = await cookies();
  const guestId = cookieStore.get('guest_id')?.value;

  /* ===========================
     NO GUEST = EMPTY STATE
  =========================== */

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

  /* ===========================
     NO ORDERS YET
  =========================== */

  if (orders.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
        <p className="text-sm text-gray-600">You haven’t placed any orders yet.</p>
      </main>
    );
  }

  /* ===========================
     ORDERS LIST
  =========================== */

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={`/order/${order._id}`}
            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-medium">Order #{order._id.toString().slice(-6)}</p>

                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right space-y-1">
                <p className="font-medium">₹{order.total}</p>

                <p className="text-sm text-gray-600">{STATUS_LABELS[order.status]}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
