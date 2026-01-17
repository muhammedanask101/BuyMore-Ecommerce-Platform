'use client';

import { useState } from 'react';
import { getCart, clearCart } from '@/lib/cart';
import { createOrder } from '@/lib/checkout';
import { ShippingAddress } from '@/types/checkout';
import { setCookie } from 'cookies-next';

type Props = {
  email: string;
  shippingAddress: ShippingAddress;
  paymentProvider?: 'razorpay' | 'cod';
  onSuccess?: (orderId: string) => void;
};

export default function CheckoutButton({
  email,
  shippingAddress,
  paymentProvider = 'cod',
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const cart = getCart();

      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const order = await createOrder({
        email,
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress,
        paymentProvider,
      });

      setCookie('guest_id', order.guestId, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      clearCart();

      onSuccess?.(order.orderId);

      // Example redirect (optional)
      // router.push(`/order/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-lg bg-black text-white py-3 disabled:opacity-50"
      >
        {loading ? 'Placing order…' : 'Place Order'}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
