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
  email: string;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  paymentProvider?: 'razorpay' | 'cod';
};

export type CreateOrderResponse = {
  orderId: string;
  guestId: string;

  total: number;
  currency: string;

  paymentOrder?: {
    id: string;
    amount: number;
    currency: string;
  };
};
