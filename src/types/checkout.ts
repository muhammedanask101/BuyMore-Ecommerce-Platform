export type CheckoutItem = {
  productId: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
};

export type CreateOrderRequest = {
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  paymentProvider?: 'stripe' | 'razorpay' | 'cod';
};

export type CreateOrderResponse = {
  orderId: string;
  total: number;
  currency: string;
};
