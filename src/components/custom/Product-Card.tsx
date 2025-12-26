'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from 'lucide-react';
import { Product } from '@/types/product';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const { slug, name, price, images, rating } = product;

  const imageUrl = images?.[0]?.url ?? null;

  const authorUsername = 'Kapithan';
  const authorImageUrl = null;

  const reviewRating = rating?.average ?? 0;
  const reviewCount = rating?.count ?? 0;

  return (
    <Link href={`/products/${slug}`}>
      <div className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border rounded-md bg-white overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square">
          <Image alt={name} fill src={imageUrl || '/public/vercel.svg'} className="object-cover" />
        </div>
        <div className="p-4 border-y flex flex-col gap-3 flex-1">
          <h2 className="text-lg font-medium line-clamp-4 ">{name}</h2>
          <div className="flex items-center gap-2" onClick={() => {}}>
            {authorImageUrl && (
              <Image
                alt={authorUsername}
                src={authorImageUrl}
                width={16}
                height={16}
                className="rounded-full border shrink-0 size-[16px]"
              />
            )}
          </div>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="relative px-2 py-1 border bg-pink-400 w-fit">
            <p className="text-sm font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(Number(price))}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse" />;
};
