import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import type { OrderDTO, OrderStatus } from '@/types/order';
import { ApproveRefundButton } from '@/components/admin/ApproveRefundButton';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ orderId: string }>;
};

/* ===========================
   STATUS LABELS
=========================== */

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending payment',
  payment_failed: 'Payment failed',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  refund_pending: 'Refund requested',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

/* ===========================
   PAGE
=========================== */

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderId } = await params;

  await connectDB();

  const order = await Order.findById(orderId).lean<OrderDTO>();
  if (!order) notFound();

  return (
    <div className="space-y-6">
      {/* ===========================
         HEADER
      =========================== */}
      <section className="border-4 border-black bg-white p-6">
        <h1 className="text-2xl font-extrabold">Order #{order._id.toString()}</h1>
        <p className="text-sm opacity-70 mt-1">
          Created {new Date(order.createdAt).toLocaleString()}
        </p>
      </section>

      {/* ===========================
         ORDER META
      =========================== */}
      <section className="border-4 border-black bg-white p-6 space-y-2">
        <p>
          <strong>Status:</strong> {STATUS_LABELS[order.status]}
        </p>

        <p>
          <strong>Payment:</strong> {order.paymentProvider ?? '—'}
        </p>

        <p>
          <strong>Total:</strong> ₹{order.total}
        </p>

        {order.paidAt && (
          <p>
            <strong>Paid at:</strong> {new Date(order.paidAt).toLocaleString()}
          </p>
        )}

        {order.cancelReason && (
          <p className="text-sm text-red-600">
            <strong>Reason:</strong> {order.cancelReason}
          </p>
        )}

        {order.paymentProvider === 'cod' && (
          <p>
            <strong>COD Verified:</strong> {order.codVerified ? 'Yes' : 'No'}
          </p>
        )}
      </section>

      {/* ===========================
         ORDER ITEMS
      =========================== */}
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

      {/* ===========================
         FULFILLMENT STATUS UPDATE
      =========================== */}
      {['processing', 'shipped'].includes(order.status) && (
        <section className="border-4 border-black bg-white p-6 space-y-4">
          <h2 className="font-extrabold">Update Fulfillment Status</h2>

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
              {order.status === 'processing' && (
                <>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                </>
              )}

              {order.status === 'shipped' && (
                <>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </>
              )}
            </select>

            <button className="border-2 border-black px-6 py-2 bg-black text-white hover:bg-white hover:text-black transition">
              Update
            </button>
          </form>
        </section>
      )}

      {/* ===========================
         REFUND DECISION (ADMIN)
      =========================== */}
      {order.status === 'refund_pending' && (
        <section className="border-4 border-black bg-white p-6 space-y-4">
          <h2 className="font-extrabold text-red-600">Refund Requested</h2>

          <div className="flex gap-4">
            {/* APPROVE */}
            <ApproveRefundButton orderId={order._id.toString()} />

            {/* REJECT */}
            <form action="/api/admin/orders/reject-refund" method="POST">
              <input type="hidden" name="orderId" value={order._id.toString()} />

              <button className="border-2 border-black px-6 py-2 bg-white hover:bg-black hover:text-white transition">
                Reject Refund
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ===========================
         INVOICE
      =========================== */}
      <section className="border-4 border-black bg-white p-6">
        <form action={`/api/admin/orders/${order._id}/invoice`} method="POST">
          <button className="border-2 border-black px-4 py-2 bg-white hover:bg-black hover:text-white transition">
            Resend Invoice
          </button>
        </form>
      </section>
    </div>
  );
}
