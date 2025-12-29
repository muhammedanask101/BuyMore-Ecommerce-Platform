import { getCart, saveCart } from '@/lib/cart';

function emitCartUpdate() {
  // Notifies all listeners in the same tab
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(productId: string, quantity = 1, size?: 'XS' | 'S' | 'M' | 'L' | 'XL') {
  const cart = getCart();

  const existing = cart.items.find((i) => i.productId === productId && i.size === size);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, size });
  }

  saveCart(cart.items);
  emitCartUpdate();
}

export function removeFromCart(productId: string) {
  const cart = getCart();

  const updated = cart.items.filter((i) => i.productId !== productId);

  saveCart(updated);
  emitCartUpdate();
}

export function clearCart() {
  saveCart([]);
  emitCartUpdate();
}
