import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation';
import { sendSms } from '@/lib/sms/sendSms';

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
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

  const form = await req.formData();
  const status = form.get('status');

  if (!['processing', 'shipped', 'delivered', 'cancelled'].includes(String(status))) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await Order.findByIdAndUpdate(params.orderId, {
    status,
    ...(status === 'cancelled' ? { cancelledAt: new Date(), cancelReason: 'admin' } : {}),
  });

  const updatedOrder = await Order.findByIdAndUpdate(
    params.orderId,
    {
      status,
      ...(status === 'cancelled' ? { cancelledAt: new Date(), cancelReason: 'admin' } : {}),
    },
    { new: true }
  ).lean();

  if (status === 'shipped') {
    await sendSms(
      updatedOrder.shippingAddress.phone,
      `Your Kapithan order ${updatedOrder._id} has been shipped`
    );
    await sendOrderConfirmationEmail(
      updatedOrder,
      updatedOrder.shippingAddress.email,
      'Your order has been shipped!'
    );
  }

  if (status === 'delivered') {
    await sendSms(
      updatedOrder.shippingAddress.phone,
      `Your Kapithan order ${updatedOrder._id} has been delivered`
    );
    await sendOrderConfirmationEmail(
      updatedOrder,
      updatedOrder.shippingAddress.email,
      'Your order has been delivered'
    );
  }

  return NextResponse.redirect(new URL(`/admin/orders/${params.orderId}`, req.url));
}
