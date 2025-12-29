import { Types } from 'mongoose';

export type OrderItemDTO = {
  productId: Types.ObjectId;
  name: string;
  price: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

export type OrderDTO = {
  _id: Types.ObjectId;
  items: OrderItemDTO[];
  total: number;
  status: string;
  guestId?: string;
};
