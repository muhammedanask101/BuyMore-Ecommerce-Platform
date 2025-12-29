import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import Order from '@/models/Order';
import { sendInvoiceEmail } from '@/lib/email/sendInvoiceEmail';

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) return NextResponse.redirect('/admin-login');

  await connectDB();

  const admin = await Admin.findById(sessionId).lean();
  if (!admin || !admin.isActive) return NextResponse.redirect('/admin-login');

  const order = await Order.findById(params.orderId).lean();
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  await sendInvoiceEmail(order, order.shippingAddress.email);

  return NextResponse.redirect(new URL(`/admin/orders/${params.orderId}`, req.url));
}
