import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';

type OrderItemInput = {
  productId: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();

    const items: OrderItemInput[] = body.items;
    const shippingAddress = body.shippingAddress;
    const paymentProvider = body.paymentProvider ?? null;

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
       BUILD ORDER ITEMS
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
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        throw new Error('Invalid cart item');
      }

      // 🔒 ATOMIC STOCK CHECK + DECREMENT
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

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, // immutable snapshot
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

    const order = await Order.create(
      [
        {
          userId: null, // still future-proof
          guestId, // 🔑 guest ownership
          items: orderItems,
          subtotal,
          tax,
          shipping,
          total,
          currency: 'INR',
          status: 'pending',
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
      orderId: order[0]._id.toString(),
      total,
      currency: 'INR',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 400 }
    );
  }
}
