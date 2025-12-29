'use client';

import Link from 'next/link';
import { ShoppingCartIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCart } from '@/lib/cart';

function getCartCount(): number {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function CartIcon() {
  // ✅ Lazy initialization (runs once, not in effect)
  const [count, setCount] = useState<number>(() => getCartCount());

  useEffect(() => {
    function handleCartUpdate() {
      setCount(getCartCount());
    }

    // Subscribe only
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  return (
    <Link href="/cart" aria-label="View cart" className="relative flex items-center justify-center">
      <ShoppingCartIcon className="size-6" />

      {count > 0 && (
        <span
          className="
            absolute -top-2 -right-2
            min-w-[18px] h-[18px]
            rounded-full bg-black text-white
            text-xs font-medium
            flex items-center justify-center
          "
        >
          {count}
        </span>
      )}
    </Link>
  );
}
