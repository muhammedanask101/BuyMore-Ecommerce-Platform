import { CartState, CartItem } from '@/types/cart';

const CART_KEY = 'buymore_cart';

export function getCart(): CartState {
  if (typeof window === 'undefined') {
    return { items: [], updatedAt: Date.now() };
  }

  const raw = localStorage.getItem(CART_KEY);
  if (!raw) {
    return { items: [], updatedAt: Date.now() };
  }

  try {
    return JSON.parse(raw) as CartState;
  } catch {
    return { items: [], updatedAt: Date.now() };
  }
}

export function saveCart(items: CartItem[]) {
  const cart: CartState = {
    items,
    updatedAt: Date.now(),
  };

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  // 🔔 notify cart icon + others
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(productId: string, quantity: number, size?: string) {
  const cart = getCart();

  const existing = cart.items.find((i) => i.productId === productId && i.size === size);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      size, // ✅ THIS WAS MISSING
    });
  }

  saveCart(cart.items);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
}
