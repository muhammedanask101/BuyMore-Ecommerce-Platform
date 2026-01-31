'use client';

import { useState } from 'react';
import { ProductListView } from '@/components/custom/Product-List';
import { ProductSort, ProductSortValue } from '@/components/custom/Product-Sort';
import { PriceFilter } from '@/components/custom/Filter-Price';
import { SearchInput, SearchInputSkeleton } from '@/components/custom/Search-Input';
import { Suspense } from 'react';

export default function Home() {
  const [sort, setSort] = useState<ProductSortValue>('curated');
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<string | null>(null);

  return (
    <>
      {showFilters && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden transition-opacity duration-200 ease-out"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-6 overflow-y-auto
             transition-all duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-lg font-semibold">Filters</p>
              <button onClick={() => setShowFilters(false)} className="text-sm font-medium">
                Close
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-base font-medium mb-3">Sort by editor&apos;s choice</p>
                <ProductSort value={sort} onChange={setSort} />
              </div>

              <div>
                <p className="text-base font-medium mb-3">Sort by price</p>
                <PriceFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="bg-gray-100">
        <div className="px-4 sm:px-6 lg:px-12 py-4 border-b-2 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-md">
              <Suspense fallback={<SearchInputSkeleton />}>
                <SearchInput onOpenFilters={() => setShowFilters(true)} />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="px-4 bg-gray-100 lg:px-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
            <aside className="hidden lg:block lg:col-span-2 xl:col-span-2">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xl  font-medium mb-4 mt-10">Sort by editor&apos;s choice</p>
                  <ProductSort value={sort} onChange={setSort} />
                </div>

                <div>
                  <p className="text-xl  font-medium mt-3 mb-3">Sort by price</p>
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
        </div>
      </main>
    </>
  );
}
