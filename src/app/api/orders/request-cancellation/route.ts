import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

/* ===========================
   REQUEST CANCELLATION
=========================== */

export async function POST(req: Request) {
  try {
    await connectDB();

    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    /* ===========================
       AUTH (GUEST)
    =========================== */

    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /* ===========================
       FIND ORDER
    =========================== */

    const order = await Order.findOne({
      _id: orderId,
      guestId,
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    /* ===========================
       VALIDATION
    =========================== */

    if (!['paid', 'processing'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled at this stage' },
        { status: 400 }
      );
    }

    /* ===========================
       UPDATE ORDER
    =========================== */

    order.status = 'refund_pending';
    order.cancelReason = reason || 'User requested cancellation';
    order.cancelledAt = new Date();

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Cancellation request submitted',
    });
  } catch (error) {
    console.error('REQUEST CANCELLATION ERROR:', error);

    return NextResponse.json({ error: 'Failed to request cancellation' }, { status: 500 });
  }
}
