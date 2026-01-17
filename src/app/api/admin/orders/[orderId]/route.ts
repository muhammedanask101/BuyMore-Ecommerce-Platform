import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import Order from '@/models/Order';
import PaymentLog from '@/models/PaymentLog';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation';
import { sendSms } from '@/lib/sms/sendSms';
import type { OrderStatus } from '@/types/order';

/* ===========================
   ALLOWED ADMIN TRANSITIONS
=========================== */

const ADMIN_NEXT_STATUSES = ['processing', 'shipped', 'delivered'] as const;
type AdminNextStatus = (typeof ADMIN_NEXT_STATUSES)[number];

function isAdminNextStatus(value: string): value is AdminNextStatus {
  return ADMIN_NEXT_STATUSES.includes(value as AdminNextStatus);
}

/* ===========================
   ROUTE
=========================== */

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  /* ===========================
     AUTH
  =========================== */

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) {
    return NextResponse.redirect(new URL('/admin-login', req.url));
  }

  await connectDB();

  const admin = await Admin.findById(sessionId).lean();
  if (!admin || !admin.isActive || admin.role !== 'admin') {
    return NextResponse.redirect(new URL('/admin-login', req.url));
  }

  /* ===========================
     INPUT
  =========================== */

  const form = await req.formData();
  const rawStatus = form.get('status');

  if (typeof rawStatus !== 'string') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (!isAdminNextStatus(rawStatus)) {
    return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
  }

  const nextStatus: AdminNextStatus = rawStatus;

  /* ===========================
     LOAD ORDER  ✅ FIX HERE
  =========================== */

  const order = await Order.findById(params.orderId);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  /* ===========================
     STATE MACHINE (CRITICAL)
  =========================== */

  const validTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
    pending_payment: [],
    payment_failed: [],
    paid: ['processing'],
    processing: ['shipped'],
    shipped: ['delivered'],
    delivered: [],
    refund_pending: [],
    refunded: [],
    cancelled: [],
  };

  const currentStatus = order.status as OrderStatus;

  if (!validTransitions[currentStatus].includes(nextStatus)) {
    return NextResponse.json(
      { error: `Cannot move order from ${currentStatus} to ${nextStatus}` },
      { status: 400 }
    );
  }

  /* ===========================
     APPLY UPDATE
  =========================== */

  order.status = nextStatus;

  if (nextStatus === 'processing') {
    order.processingAt = new Date();
  }

  if (nextStatus === 'shipped') {
    order.shippedAt = new Date();
  }

  if (nextStatus === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  /* ===========================
     PAYMENT LOG
  =========================== */

  await PaymentLog.create({
    orderId: order._id,
    provider: order.paymentProvider,
    event: `order_${nextStatus}`,
    amount: order.total,
  });

  /* ===========================
     CUSTOMER NOTIFICATIONS
  =========================== */

  const shortId = order._id.toString().slice(-6);

  if (nextStatus === 'shipped') {
    await sendSms(order.shippingAddress.phone, `Your Kapithan order #${shortId} has been shipped`);

    if (order.shippingAddress.email) {
      await sendOrderConfirmationEmail(
        order,
        order.shippingAddress.email,
        'Your order has been shipped'
      );
    }
  }

  if (nextStatus === 'delivered') {
    await sendSms(
      order.shippingAddress.phone,
      `Your Kapithan order #${shortId} has been delivered`
    );

    if (order.shippingAddress.email) {
      await sendOrderConfirmationEmail(
        order,
        order.shippingAddress.email,
        'Your order has been delivered'
      );
    }
  }

  return NextResponse.redirect(new URL(`/admin/orders/${order._id}`, req.url));
}
