'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart } from '@/lib/cart';
import { createOrder } from '@/lib/checkout';
import type { ShippingAddress } from '@/types/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  function updateField(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePlaceOrder() {
    setLoading(true);
    setError(null);

    try {
      const cart = getCart();

      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const order = await createOrder({
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress: address,
        paymentProvider: 'razorpay',
      });

      // Redirect to confirmation (payment comes next)
      router.push(`/order/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        <input
          placeholder="Full name"
          value={address.name}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Phone"
          value={address.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Address line 1"
          value={address.addressLine1}
          onChange={(e) => updateField('addressLine1', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <input
          placeholder="Address line 2 (optional)"
          value={address.addressLine2}
          onChange={(e) => updateField('addressLine2', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="City"
            value={address.city}
            onChange={(e) => updateField('city', e.target.value)}
            className="border rounded px-3 py-2"
          />

          <input
            placeholder="State"
            value={address.state}
            onChange={(e) => updateField('state', e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <input
          placeholder="Postal code"
          value={address.postalCode}
          onChange={(e) => updateField('postalCode', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="mt-8 w-full bg-black text-white py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Placing order…' : 'Place order'}
      </button>
    </main>
  );
}
