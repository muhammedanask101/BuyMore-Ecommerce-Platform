import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import type { OrderDTO } from '@/types/order';

type Props = {
  params: { orderId: string };
};

export default async function OrderConfirmationPage({ params }: Props) {
  await connectDB();

  const cookieStore = await cookies();
  const guestId = cookieStore.get('guest_id')?.value;

  if (!guestId) {
    notFound();
  }

  const order = await Order.findOne({
    _id: params.orderId,
    guestId,
  }).lean<OrderDTO>();

  if (!order) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Order placed</h1>

      <p className="text-sm text-gray-600 mb-6">Order ID: {order._id.toString()}</p>

      <div className="border rounded-lg p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.productId.toString()} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}

        <div className="border-t pt-3 flex justify-between font-medium">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      <p className="mt-6 text-sm">
        Payment status: <strong className="capitalize">{order.status}</strong>
      </p>

      {order.status === 'pending' && (
        <p className="mt-2 text-sm text-orange-600">
          Please complete payment to process your order.
        </p>
      )}
    </main>
  );
}
