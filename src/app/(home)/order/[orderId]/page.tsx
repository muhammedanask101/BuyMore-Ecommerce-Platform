import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import type { OrderDTO, OrderStatus } from '@/types/order';
import { PayButton } from '@/components/custom/PayButton';
import { RequestRefundButton } from '@/components/order/RequestRefundButton';
import { CancelOrderButton } from '@/components/order/CancelOrderButton';

/* ===========================
   STATUS LABELS
=========================== */

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Payment pending',
  payment_failed: 'Payment failed',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refund_pending: 'Refund under review',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailsPage({ params }: Props) {
  const { orderId } = await params;

  await connectDB();

  const cookieStore = await cookies();
  const guestId = cookieStore.get('guest_id')?.value;

  if (!guestId) notFound();

  const order = await Order.findOne({
    _id: orderId,
    guestId,
  }).lean<OrderDTO>();

  if (!order) notFound();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Order details</h1>

      <p className="text-sm text-gray-600">Order ID: {order._id.toString()}</p>

      {/* ===========================
         ITEMS
      =========================== */}
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
         STATUS
      =========================== */}
      <div className="border rounded-lg p-4 space-y-1">
        <p className="font-medium">Status: {STATUS_LABELS[order.status]}</p>

        {order.paidAt && (
          <p className="text-sm text-gray-600">Paid on {new Date(order.paidAt).toLocaleString()}</p>
        )}
      </div>

      {/* ===========================
   USER REFUND / CANCELLATION
=========================== */}
      {(order.status === 'paid' || order.status === 'processing') && (
        <RequestRefundButton orderId={order._id.toString()} />
      )}

      {order.status === 'pending_payment' && <CancelOrderButton orderId={order._id.toString()} />}

      {/* ===========================
         RETRY PAYMENT
      =========================== */}
      {order.status === 'pending_payment' && order.paymentProvider === 'razorpay' && (
        <div className="space-y-2">
          <p className="text-sm text-red-600">Payment not completed. You can retry safely.</p>
          <PayButton orderId={order._id.toString()} />
        </div>
      )}

      {/* ===========================
         REFUND PENDING
      =========================== */}
      {order.status === 'refund_pending' && (
        <div className="border rounded-lg p-4 bg-yellow-50">
          <p className="font-medium text-yellow-700">Refund under review</p>
          <p className="text-sm text-yellow-700">We’ll notify you once the refund is processed.</p>
        </div>
      )}

      {/* ===========================
         COD MESSAGE
      =========================== */}
      {order.paymentProvider === 'cod' && (
        <div className="border rounded-lg p-4 bg-yellow-100">
          <p className="font-medium">Cash on Delivery</p>
          <p className="text-sm">Please keep the payment ready at delivery.</p>
        </div>
      )}
    </main>
  );
}
