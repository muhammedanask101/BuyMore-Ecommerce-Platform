'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCart, saveCart } from '@/lib/cart';

type ValidatedCartItemDTO = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  size?: string | null;
};

type ValidatedItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  size?: string | null;
};

export default function CartPage() {
  const router = useRouter();

  const [items, setItems] = useState<ValidatedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===========================
     CART VALIDATION (INITIAL)
  ============================ */
  async function validateCart(silent = false) {
    try {
      const cart = getCart();

      if (cart.items.length === 0) {
        setItems([]);
        setTotal(0);
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

      const mappedItems: ValidatedItem[] = data.items.map((i: ValidatedCartItemDTO) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.subtotal,
        inStock: i.inStock,
        size: i.size ?? null,
      }));

      setItems(mappedItems);

      setTotal(data.total);
      setCurrency(data.currency);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    validateCart();
  }, []);

  /* ===========================
     MUTATIONS (OPTIMISTIC)
  ============================ */
  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return;

    const cart = getCart();
    const updated = cart.items.map((i) => (i.productId === productId ? { ...i, quantity } : i));

    saveCart(updated);
    validateCart(true); // silent
  }

  function updateSize(productId: string, size: string) {
    const cart = getCart();

    const updated = cart.items.map((i) =>
      i.productId === productId ? { ...i, size: size.trim() || undefined } : i
    );

    saveCart(updated);
    validateCart(true); // silent
  }

  function removeItem(productId: string) {
    const cart = getCart();
    const updated = cart.items.filter((i) => i.productId !== productId);

    saveCart(updated);
    validateCart(true);
  }

  /* ===========================
     SKELETON (INITIAL ONLY)
  ============================ */
  if (loading) {
    return (
      <main className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="h-7 w-32 bg-neutral-200 animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="border-2 border-black p-4 animate-pulse">
            <div className="h-4 w-48 bg-neutral-200 mb-2" />
            <div className="h-3 w-32 bg-neutral-200" />
          </div>
        ))}
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your cart</h1>
        <p className="border-2 border-black p-6">Your cart is empty.</p>
      </main>
    );
  }

  const hasOutOfStock = items.some((i) => !i.inStock);

  /* ===========================
     UI
  ============================ */
  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your cart</h1>

      {error && <p className="mb-4 border-2 border-black bg-red-100 p-3 text-sm">{error}</p>}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="border-2 border-black p-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4"
          >
            {/* LEFT */}
            <div>
              <p className="font-semibold text-lg">{item.name}</p>

              <p className="text-sm mt-1">
                {currency} {item.price} × {item.quantity}
              </p>

              {!item.inStock && (
                <p className="text-sm text-red-600 font-medium mt-1">Out of stock</p>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center h-[36px] border-2 border-black">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="px-2 font-bold"
                >
                  −
                </button>
                <span className="px-3">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="px-2 font-bold"
                >
                  +
                </button>
              </div>

              {/* Size */}
              <input
                type="text"
                inputMode="numeric"
                placeholder={item.size ?? 'Size'}
                value={item.size ?? ''}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((i) =>
                      i.productId === item.productId ? { ...i, size: e.target.value } : i
                    )
                  )
                }
                onBlur={(e) => updateSize(item.productId, e.target.value)}
                className="w-20 border-2 border-black px-2 py-1 text-center"
              />

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                className="border-2 bg-red-600 text-white border-black px-3 py-1 hover:bg-black hover:text-white"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-8 border-t-2 border-black pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <p className="text-lg font-bold">
          Total: {currency} {total}
        </p>

        <button
          disabled={hasOutOfStock}
          onClick={() => router.push('/checkout')}
          className="border-2 border-black px-6 py-3 bg-black text-white font-semibold hover:bg-white hover:text-black disabled:opacity-40"
        >
          Proceed to checkout
        </button>
      </div>

      {hasOutOfStock && (
        <p className="mt-4 text-sm border-2 border-black bg-yellow-100 p-3">
          Please remove or update out-of-stock items before checkout.
        </p>
      )}
    </main>
  );
}
