import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import PhoneVerification from '@/models/PhoneVerification';
import { normalizeIndianPhone } from '@/lib/utils/phone';

/* ===========================
   TYPES
=========================== */

type OrderItemInput = {
  productId: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

/* ===========================
   CREATE ORDER (FINAL)
=========================== */

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();

    const items: OrderItemInput[] = body.items;
    const shippingAddress = body.shippingAddress;
    const paymentProvider: 'razorpay' | 'cod' = body.paymentProvider;

    if (paymentProvider === 'cod') {
      const phone = normalizeIndianPhone(shippingAddress.phone);

      const record = await PhoneVerification.findOne({
        phone,
        verified: true,
      });

      if (!record) {
        throw new Error('Please verify phone number to use Cash on Delivery');
      }
    }

    /* ===========================
       VALIDATION
    =========================== */

    if (!['razorpay', 'cod'].includes(paymentProvider)) {
      throw new Error('Invalid payment provider');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain items');
    }

    if (
      !shippingAddress?.name ||
      !shippingAddress?.phone ||
      !shippingAddress?.addressLine1 ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.postalCode
    ) {
      throw new Error('Invalid shipping address');
    }

    /* ===========================
       GUEST IDENTIFICATION
    =========================== */

    const cookieStore = await cookies();
    let guestId = cookieStore.get('guest_id')?.value;

    if (!guestId) {
      guestId = crypto.randomUUID();
      cookieStore.set('guest_id', guestId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    /* ===========================
       BUILD ORDER ITEMS + LOCK STOCK
    =========================== */

    let subtotal = 0;
    const orderItems: {
      productId: mongoose.Types.ObjectId;
      name: string;
      price: number;
      size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
          session,
        }
      ).lean();

      if (!product) {
        throw new Error('Product out of stock');
      }

      subtotal += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
      });
    }

    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    /* ===========================
       CREATE ORDER
    =========================== */

    const [order] = await Order.create(
      [
        {
          userId: null,
          guestId,

          /* ===== Contact (India-first) ===== */
          contact: {
            phone: shippingAddress.phone,
            email: shippingAddress.email, // optional
          },

          items: orderItems,
          subtotal,
          tax,
          shipping,
          total,
          currency: 'INR',

          status: paymentProvider === 'cod' ? 'processing' : 'pending_payment',
          paymentProvider,

          shippingAddress: {
            ...shippingAddress,
            country: shippingAddress.country ?? 'India',
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      orderId: order._id.toString(),
      total,
      currency: 'INR',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Order creation failed',
      },
      { status: 400 }
    );
  }
}
