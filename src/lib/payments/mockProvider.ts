import crypto from 'crypto';
import { PaymentProvider } from './provider';

export const mockPaymentProvider: PaymentProvider = {
  async createOrder({ amount, currency }) {
    return {
      id: 'mock_order_' + crypto.randomUUID(),
      amount,
      currency,
    };
  },

  async verifyPayment() {
    return true;
  },

  async refund() {
    return {
      refundId: 'mock_refund_' + crypto.randomUUID(),
    };
  },
};
