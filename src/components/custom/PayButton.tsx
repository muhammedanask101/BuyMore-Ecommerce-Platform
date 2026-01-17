'use client';

import Script from 'next/script';
const IS_MOCK = process.env.NEXT_PUBLIC_PAYMENTS_MODE === 'mock';

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayModalOptions = {
  ondismiss?: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: RazorpayModalOptions;
};

/* ===========================
   GLOBAL DECLARATION
=========================== */

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

/* ===========================
   COMPONENT
=========================== */

export function PayButton({ orderId }: { orderId: string }) {
  async function pay() {
    if (IS_MOCK) {
      await fetch('/api/orders/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
        }),
      });

      window.location.reload();
      return;
    }

    const res = await fetch('/api/payments/razorpay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (!res.ok) {
      alert('Failed to initiate payment');
      return;
    }

    const data: {
      razorpayOrderId: string;
      key: string;
      amount: number;
      currency: string;
    } = await res.json();

    const options: RazorpayOptions = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'Kapithan',
      order_id: data.razorpayOrderId,

      handler: async (response) => {
        await fetch('/api/payments/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response),
        });

        // Reflect updated order status
        window.location.reload();
      },

      modal: {
        ondismiss: async () => {
          await fetch('/api/payments/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              provider: 'razorpay',
              event: 'cancelled',
            }),
          });
        },
      },
    };

    await fetch('/api/payments/log', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        provider: 'razorpay',
        event: 'attempted',
      }),
    });

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <button
        onClick={pay}
        className="
          mt-6 w-full
          border-4 border-black
          bg-black text-white
          py-4
          font-black uppercase
          hover:bg-pink-400 hover:text-black
          transition
        "
      >
        Retry Payment
      </button>
    </>
  );
}
