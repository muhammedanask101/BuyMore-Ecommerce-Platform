'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard, ProductCardSkeleton } from '@/components/custom/Product-Card';
import { Button } from '@/components/ui/button';
import { InboxIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_LIMIT = 8;

interface ProductsResponse {
  docs: Product[];
  nextPage: number | null;
}

interface Props {
  sort: 'curated' | 'trending' | 'hot_and_new';
  minPrice?: string | null;
  maxPrice?: string | null;
  narrowView?: boolean;
}

export const ProductListView = ({ narrowView, sort, minPrice, maxPrice }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialProducts() {
      try {
        setIsInitialLoading(true);

        const params = new URLSearchParams({
          page: '1',
          limit: PAGE_LIMIT.toString(),
          sort,
          ...(minPrice ? { minPrice } : {}),
          ...(maxPrice ? { maxPrice } : {}),
        });

        const res = await fetch(`/api/products?${params.toString()}`, {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to fetch products');

        const data: ProductsResponse = await res.json();

        if (!cancelled) {
          setProducts(data.docs);
          setHasNextPage(Boolean(data.nextPage));
          setPage(1);
        }
      } finally {
        if (!cancelled) setIsInitialLoading(false);
      }
    }

    loadInitialProducts();

    return () => {
      cancelled = true;
    };
  }, [sort, , minPrice, maxPrice]);

  const loadMore = async () => {
    if (!hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);

    const res = await fetch(`/api/products?page=${page + 1}&limit=${PAGE_LIMIT}&sort=${sort}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data: ProductsResponse = await res.json();
      setProducts((prev) => [...prev, ...data.docs]);
      setHasNextPage(Boolean(data.nextPage));
      setPage((p) => p + 1);
    }

    setIsLoadingMore(false);
  };

  if (!isInitialLoading && products.length === 0) {
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-base font-medium">No products found</p>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-12 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-medium">Curated for you</p>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
          narrowView && 'lg:grid-cols-2 xl:grid-cols-3'
        )}
      >
        {isInitialLoading &&
          Array.from({ length: PAGE_LIMIT }).map((_, i) => <ProductCardSkeleton key={i} />)}

        {!isInitialLoading &&
          products.map((product) => <ProductCard key={product.slug} product={product} />)}

        {isLoadingMore &&
          Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`more-${i}`} />)}
      </div>

      {hasNextPage && !isInitialLoading && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="font-medium text-base bg-white disabled:opacity-50"
            variant="outline"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
};
