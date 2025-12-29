import { CartState, CartItem } from '@/types/cart';

const CART_KEY = 'kapithan_cart';

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
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
