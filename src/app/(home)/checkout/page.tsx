'use client';

import { useState } from 'react';
import { getCart } from '@/lib/cart';
import type { ShippingAddress } from '@/types/checkout';
import { buildWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { normalizeIndianPhone } from '@/lib/utils/phone';
import { validateCheckoutAddress } from '@/lib/validators/checkout';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminPhone = normalizeIndianPhone(process.env.NEXT_PUBLIC_ADMIN_WHATSAPP!);

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

      const { error, value } = validateCheckoutAddress(address);

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      const validatedAddress = value!;

      const validateRes = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size ?? undefined,
          })),
        }),
      });

      if (!validateRes.ok) {
        throw new Error('Failed to validate cart');
      }

      const { items, total } = await validateRes.json();

      const orderPayload = {
        customer: {
          name: validatedAddress.name,
          phone: validatedAddress.phone,
          addressLine1: validatedAddress.addressLine1,
          addressLine2: validatedAddress.addressLine2,
          landmark: validatedAddress.landmark,
          city: validatedAddress.city,
          state: validatedAddress.state,
          postalCode: validatedAddress.postalCode,
        },
        items,
        total,
      };

      const message = buildWhatsAppMessage(orderPayload);
      const whatsappUrl = getWhatsAppUrl(adminPhone, message);

      window.location.href = whatsappUrl;
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

        <input
          placeholder="Landmark (optional)"
          value={address.landmark ?? ''}
          onChange={(e) => updateField('landmark', e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-black text-white hover:bg-white hover:text-green-600 hover:font-extrabold hover:border-2 hover:border-black py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {loading ? 'Preparing WhatsApp…' : 'Order on WhatsApp'}
      </button>
    </main>
  );
}
