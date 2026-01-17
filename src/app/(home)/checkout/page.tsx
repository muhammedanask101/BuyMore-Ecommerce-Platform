'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart } from '@/lib/cart';
import { createOrder } from '@/lib/checkout';
import type { ShippingAddress } from '@/types/checkout';
import { setCookie } from 'cookies-next';

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ===========================
     EMAIL (ORDER IDENTITY)
  ============================ */
  const [email, setEmail] = useState('');

  /* ===========================
     PAYMENT METHOD
  ============================ */
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  /* ===========================
     SHIPPING ADDRESS
  ============================ */
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

  /* ===========================
     PLACE ORDER
  ============================ */
  async function handlePlaceOrder() {
    setLoading(true);
    setError(null);

    try {
      const cart = getCart();

      if (!email) {
        throw new Error('Email is required');
      }

      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      if (
        !address.name ||
        !address.phone ||
        !address.addressLine1 ||
        !address.city ||
        !address.state ||
        !address.postalCode
      ) {
        throw new Error('Please fill all required address fields');
      }

      const order = await createOrder({
        email, // ✅ REQUIRED & NOW PRESENT
        items: cart.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
        })),
        shippingAddress: address,
        paymentProvider: paymentMethod,
      });

      setCookie('guest_id', order.guestId, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      router.push(`/order/${order.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* ===========================
         EMAIL
      ============================ */}
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required
      />

      {/* ===========================
         SHIPPING ADDRESS
      ============================ */}
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

      {/* ===========================
         PAYMENT METHOD
      ============================ */}
      <div className="border rounded-lg p-4 space-y-2">
        <p className="font-medium">Payment Method</p>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={paymentMethod === 'razorpay'}
            onChange={() => setPaymentMethod('razorpay')}
          />
          Pay Online (UPI / Card)
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
          />
          Cash on Delivery
        </label>
      </div>

      {/* ===========================
         PLACE ORDER
      ============================ */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {loading
          ? 'Placing order…'
          : paymentMethod === 'cod'
            ? 'Place COD Order'
            : 'Proceed to Payment'}
      </button>
    </main>
  );
}
