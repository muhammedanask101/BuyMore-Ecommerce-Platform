'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from 'lucide-react';
import { Product } from '@/types/product';
import { ShoppingCartIcon } from 'lucide-react';
import { addToCart } from '@/lib/cart-actions';
import { useToast } from '@/components/custom/ToastProvider';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const { slug, name, price, primaryImage, primaryImageAlt, rating } = product;

  const reviewRating = rating?.average ?? 0;
  const reviewCount = rating?.count ?? 0;

  const { showAddedToCart } = useToast();

  return (
    <>
      <div className="h-full flex flex-col border-2 border-black bg-white overflow-hidden transition-shadow hover:shadow-[4px_4px_0_0_#000]">
        <div className="relative aspect-square bg-neutral-100">
          <Link href={`/products/${slug}`}>
            <Image
              src={primaryImage || '/placeholder.png'}
              alt={primaryImageAlt || name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover"
              priority={false}
            />
          </Link>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product._id, 1);
              showAddedToCart();
            }}
            className="absolute top-2 right-2 z-10 flex items-center justify-center
               size-9 rounded-full border-2 border-black bg-white
               hover:bg-black hover:text-white transition"
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="size-4" />
          </button>
        </div>

        <Link href={`/products/${slug}`} className="flex flex-col flex-1">
          {/* Content */}
          <div className="flex flex-col gap-3 p-4 border-t-2 border-black flex-1">
            <h2 className="text-lg font-medium leading-snug line-clamp-3">{name}</h2>

            {reviewCount > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium">
                <StarIcon className="size-3.5 fill-black" />
                <span>
                  {reviewRating} ({reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="p-4 border-t-2 border-black">
            <div className="inline-block px-2 py-1 border-2 border-black bg-pink-400">
              <p className="text-sm font-medium">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(price)}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="h-full border-2 border-black bg-neutral-200 animate-pulse">
      <div className="aspect-square bg-neutral-300" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-300 w-3/4" />
        <div className="h-3 bg-neutral-300 w-1/2" />
      </div>
      <div className="p-4">
        <div className="h-6 bg-neutral-300 w-20" />
      </div>
    </div>
  );
};
