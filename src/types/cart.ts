export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
};

export type CartState = {
  items: CartItem[];
  updatedAt: number;
};
