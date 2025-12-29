import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation';
import { sendInvoiceEmail } from '@/lib/email/sendInvoiceEmail';
import { sendSms } from '@/lib/sms/sendSms';

/* ===========================
   TYPES
=========================== */

type OrderItemInput = {
  productId: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

/* ===========================
   COD OTP HELPERS
=========================== */

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/* ===========================
   CREATE ORDER
=========================== */

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();

    const items: OrderItemInput[] = body.items;
    const shippingAddress = body.shippingAddress;
    const paymentProvider: 'razorpay' | 'cod' | null = body.paymentProvider ?? null;

    /* ===========================
       VALIDATION
    =========================== */

    if (paymentProvider !== 'razorpay' && paymentProvider !== 'cod') {
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
       COD FRAUD PROTECTION
    =========================== */

    let codFields: {
      codVerified?: boolean;
      codOtp?: string;
      codOtpExpiresAt?: Date;
    } = {};

    if (paymentProvider === 'cod') {
      // Limit: max 2 COD orders per 7 days
      const recentCodCount = await Order.countDocuments({
        guestId,
        paymentProvider: 'cod',
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }).session(session);

      if (recentCodCount >= 2) {
        throw new Error('COD limit exceeded. Please pay online.');
      }

      // Only one unverified COD at a time
      const activeUnverified = await Order.findOne({
        guestId,
        paymentProvider: 'cod',
        codVerified: false,
      }).session(session);

      if (activeUnverified) {
        throw new Error('Please verify previous COD order first.');
      }

      const otp = generateOtp();

      codFields = {
        codVerified: false,
        codOtp: hashOtp(otp),
        codOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      };

      await sendSms(shippingAddress.phone, `Your Kapithan COD OTP is ${otp}`);

      // DEV ONLY — replace with SMS gateway later
      console.log('COD OTP (dev only):', otp);
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

      subtotal += product.price * item.quantity;

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
          userId: null,
          guestId,
          items: orderItems,
          subtotal,
          tax,
          shipping,
          total,
          currency: 'INR',

          status: paymentProvider === 'cod' ? 'processing' : 'pending',
          paymentProvider,

          shippingAddress: {
            ...shippingAddress,
            country: shippingAddress.country ?? 'India',
          },

          ...codFields, // 🔑 COD OTP + verification fields
        },
      ],
      { session }
    );

    const orderDoc = order[0].toObject();

    await sendOrderConfirmationEmail(orderDoc, shippingAddress.email);
    await sendInvoiceEmail(orderDoc, shippingAddress.email);

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
