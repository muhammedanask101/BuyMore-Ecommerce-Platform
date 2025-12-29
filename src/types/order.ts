import { Types } from 'mongoose';

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

  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

  paymentProvider?: 'razorpay' | 'cod' | null;

  /* ===== COD ===== */
  codVerified?: boolean;

  createdAt: string;
  updatedAt: string;
};
