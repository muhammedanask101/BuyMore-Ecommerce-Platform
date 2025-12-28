export type MediaDTO = {
  _id: string;
  url: string;
  isPrimary: boolean;
  seo?: {
    altText?: string;
  };
};

export type SizeOption = {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  chest: number;
  length: number;
  shoulder: number;
};

export type ProductPageDTO = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  currency?: string;
  stock: number;
  description?: string;
  shortDescription?: string;
  tags?: string[];
  rating?: {
    average: number;
    count: number;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  media: MediaDTO[];
  sizes?: SizeOption[];
};
