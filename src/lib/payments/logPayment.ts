import PaymentLog from '@/models/PaymentLog';
import type { Types } from 'mongoose';

type LogPaymentInput = {
  orderId: Types.ObjectId | string;
  provider: 'razorpay' | 'cod';
  event:
    | 'created'
    | 'attempted'
    | 'success'
    | 'failed'
    | 'cancelled'
    | 'cod_created'
    | 'cod_verified'
    | 'refund';
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export async function logPayment(input: LogPaymentInput) {
  try {
    await PaymentLog.create({
      ...input,
      orderId: input.orderId,
    });
  } catch (err) {
    // 🔕 logging must NEVER break checkout
    console.error('[PAYMENT LOG ERROR]', err);
  }
}
