import { mockPaymentProvider } from './mockProvider';
// import { razorpayProvider } from './razorpayProvider'

export const paymentProvider =
  process.env.PAYMENTS_MODE === 'razorpay'
    ? (() => {
        throw new Error('Razorpay not configured yet');
      })()
    : mockPaymentProvider;
