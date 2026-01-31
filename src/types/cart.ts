export type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
};

export type CartState = {
  items: CartItem[];
  updatedAt: number;
};
