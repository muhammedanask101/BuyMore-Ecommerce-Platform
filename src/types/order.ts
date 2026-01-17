import { Types } from 'mongoose';

/* ===========================
   ORDER STATUS (SINGLE SOURCE OF TRUTH)
=========================== */

export type OrderStatus =
  | 'pending_payment' // order created, awaiting payment
  | 'payment_failed' // payment attempt failed
  | 'paid' // payment confirmed
  | 'processing' // preparing shipment
  | 'shipped'
  | 'delivered'
  | 'cancelled' // cancelled before shipment
  | 'refund_pending' // refund initiated
  | 'refunded';

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

  contact: {
    phone: string;
    email?: string;
  };

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

  status:
    | 'pending_payment'
    | 'payment_failed'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refund_pending'
    | 'refunded';

  paymentProvider?: 'razorpay' | 'cod';

  codVerified?: boolean;

  createdAt: string;
  updatedAt: string;
};
