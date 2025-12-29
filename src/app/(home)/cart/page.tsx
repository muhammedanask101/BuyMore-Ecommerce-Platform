'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, saveCart } from '@/lib/cart';

type ValidatedItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
};

type CartValidateResponse = {
  items: ValidatedItem[];
  total: number;
  currency: string;
};

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<ValidatedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Load & validate cart
  useEffect(() => {
    async function validateCart() {
      try {
        const cart = getCart();

        if (cart.items.length === 0) {
          setItems([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart.items }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to validate cart');
        }

        setItems(data.items);
        setTotal(data.total);
        setCurrency(data.currency);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    validateCart();
  }, []);

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return;

    const cart = getCart();
    const updated = cart.items.map((i) => (i.productId === productId ? { ...i, quantity } : i));

    saveCart(updated);
    window.location.reload(); // intentional simple refresh
  }

  function removeItem(productId: string) {
    const cart = getCart();
    const updated = cart.items.filter((i) => i.productId !== productId);

    saveCart(updated);
    window.location.reload();
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Loading cart…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Your cart</h1>
        <p>Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Your cart</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between items-center border p-4 rounded-lg"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">
                {currency} {item.price} × {item.quantity}
              </p>

              {!item.inStock && <p className="text-sm text-red-600 mt-1">Out of stock</p>}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                className="w-16 border rounded px-2 py-1"
              />

              <button onClick={() => removeItem(item.productId)} className="text-sm text-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6 flex justify-between items-center">
        <p className="text-lg font-semibold">
          Total: {currency} {total}
        </p>

        <button
          onClick={() => router.push('/checkout')}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Proceed to checkout
        </button>
      </div>
    </main>
  );
}
