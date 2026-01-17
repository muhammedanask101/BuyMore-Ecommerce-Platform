import { Types } from 'mongoose';

/* ===========================
   ORDER STATUS (SINGLE SOURCE OF TRUTH)
=========================== */

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'refund_pending'
  | 'refunded'
  | 'cancelled';

/* ===========================
   ORDER ITEM (IMMUTABLE SNAPSHOT)
=========================== */

export type OrderItemDTO = {
  productId: Types.ObjectId;
  name: string;
  price: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

export type OrderDTO = {
  _id: string;

  guestId?: string | null;
  userId?: string | null;

  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  }[];

  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;

  status: OrderStatus;

  paymentProvider?: 'razorpay' | 'cod' | null;

  paidAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  codVerified?: boolean;

  createdAt: string;
  updatedAt: string;
};
