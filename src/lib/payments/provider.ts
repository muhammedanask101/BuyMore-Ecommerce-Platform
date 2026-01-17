export type CreatePaymentOrderInput = {
  amount: number;
  currency: string;
  receipt: string;
};

export type PaymentOrder = {
  id: string;
  amount: number;
  currency: string;
};

export interface PaymentProvider {
  createOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;
  verifyPayment(input: { orderId: string; paymentId: string; signature: string }): Promise<boolean>;
  refund(paymentId: string, amount: number): Promise<{ refundId: string }>;
}
