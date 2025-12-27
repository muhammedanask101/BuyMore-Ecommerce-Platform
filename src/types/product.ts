export type ProductImage = {
  url: string;
  alt?: string;
};

export type ProductSEO = {
  title?: string;
  description?: string;
};

export type ProductRating = {
  average: number;
  count: number;
};

export type ProductStatus = 'draft' | 'active' | 'archived';

export type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency: 'INR';
  stock: number;
  trackInventory: boolean;
  description?: string;
  shortDescription?: string;
  categories?: string[];
  tags?: string[];
  rating: ProductRating;
  status: ProductStatus;
  isFeatured: boolean;
  primaryImage?: string | null;
  primaryImageAlt?: string | null;
  seo?: ProductSEO;
  createdAt: string;
  updatedAt: string;
};
