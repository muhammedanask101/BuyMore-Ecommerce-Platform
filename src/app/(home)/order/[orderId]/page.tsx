import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import type { OrderDTO } from '@/types/order';
import { PayButton } from '@/components/custom/PayButton';

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params; // ✅ unwrap params

  await connectDB();

  const cookieStore = await cookies(); // ✅ NOT async
  const guestId = cookieStore.get('guest_id')?.value;

  if (!guestId) {
    notFound();
  }

  const order = await Order.findOne({
    _id: orderId,
    guestId,
  }).lean<OrderDTO>();

  if (!order) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Order placed</h1>

      <p className="text-sm text-gray-600">Order ID: {order._id.toString()}</p>

      {/* ===========================
         ORDER ITEMS
      ============================ */}
      <div className="border rounded-lg p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.productId.toString()} className="flex justify-between text-sm">
            <span>
              {item.name} × {item.quantity}
              {item.size ? ` (${item.size})` : ''}
            </span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}

        <div className="border-t pt-3 flex justify-between font-medium">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      {/* ===========================
         PAYMENT STATUS
      ============================ */}
      <p className="text-sm">
        Payment status: <strong className="capitalize">{order.status}</strong>
      </p>

      {/* ===========================
         COD MESSAGE
      ============================ */}
      {order.paymentProvider === 'cod' && (
        <div className="rounded border-2 border-black p-4 bg-yellow-100">
          <p className="font-medium">Cash on Delivery selected.</p>
          <p className="text-sm">Please keep the payment ready at the time of delivery.</p>
        </div>
      )}

      {/* ===========================
         ONLINE PAYMENT – RETRY
      ============================ */}
      {order.status === 'pending_payment' && order.paymentProvider === 'razorpay' && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">Payment not completed. You can retry safely.</p>

          <PayButton orderId={order._id.toString()} />
        </div>
      )}

      {/* ===========================
         PAYMENT SUCCESS
      ============================ */}
      {order.status === 'paid' && (
        <p className="text-sm text-green-600">Payment received successfully.</p>
      )}

      {/* ===========================
         COD OTP
      ============================ */}
      {order.paymentProvider === 'cod' && !order.codVerified && (
        <div className="border rounded p-4 space-y-3">
          <p className="text-sm font-medium">Verify your phone number to confirm COD order</p>

          <form action="/api/orders/cod/verify" method="post">
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              className="border px-3 py-2 w-full"
            />
            <button className="mt-2 w-full bg-black text-white py-2">Verify OTP</button>
          </form>
        </div>
      )}
    </main>
  );
}
