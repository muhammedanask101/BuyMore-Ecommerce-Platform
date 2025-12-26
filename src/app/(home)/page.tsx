'use client';

import { useState } from 'react';
import { ProductListView } from '@/components/custom/Product-List';
import { ProductSort, ProductSortValue } from '@/components/custom/Product-Sort';
import { PriceFilter } from '@/components/custom/Filter-Price';

export default function Home() {
  const [sort, setSort] = useState<ProductSortValue>('curated');
  const [minPrice, setMinPrice] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<string | null>(null);

  return (
    <main className="px-4 lg:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
        <aside className="lg:col-span-2 xl:col-span-2">
          <div className="sticky top-24 flex flex-col gap-4">
            <div>
              <p className="text-xl text-yellow-500 font-medium mb-4 mt-10">
                Sort by editor's choice
              </p>
              <ProductSort value={sort} onChange={setSort} />
            </div>

            <div>
              <p className="text-xl text-red-600 font-medium mt-3 mb-3">Sort by price</p>
              <PriceFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
              />
            </div>
          </div>
        </aside>

        <section className="lg:col-span-4 xl:col-span-6">
          <ProductListView sort={sort} />
        </section>
      </div>
    </main>
  );
}
