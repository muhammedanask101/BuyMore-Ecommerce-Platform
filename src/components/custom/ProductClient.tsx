'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductPageDTO, SizeOption } from '@/types/product-page';
import { addToCart } from '@/lib/cart-actions';
import { useToast } from '@/components/custom/ToastProvider';

export default function ProductClient({ product }: { product: ProductPageDTO }) {
  const images = product.media ?? [];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const { showAddedToCart } = useToast();

  const sizes: SizeOption[] = product.sizes ?? [
    { size: 'S', width: 38, length: 26, height: 16 },
    { size: 'M', width: 40, length: 27, height: 17 },
    { size: 'L', width: 42, length: 28, height: 18 },
    { size: 'XL', width: 44, length: 29, height: 19 },
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-4 py-10">
      {/* HEADER */}
      <header className="mb-10 space-y-3">
        <h1 className="text-4xl sm:text-5xl font-black uppercase">{product.name}</h1>

        <div className="flex gap-3 flex-wrap">
          <span className="border-2 border-black px-3 py-1 text-xs font-black">
            SKU: {product._id.slice(-6).toUpperCase()}
          </span>

          {product.stock > 0 ? (
            <span className="border-2 border-black px-3 py-1 text-xs font-black bg-lime-300">
              {product.stock} IN STOCK
            </span>
          ) : (
            <span className="border-2 border-black px-3 py-1 text-xs font-black bg-red-400">
              OUT OF STOCK
            </span>
          )}
        </div>
      </header>

      {/* GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* IMAGE STACK */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="border-4 border-black bg-white">
              {activeImage && (
                <Image
                  src={activeImage.url}
                  alt={activeImage.seo?.altText || product.name}
                  width={900}
                  height={900}
                  priority
                  className="w-full aspect-square object-cover"
                />
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img) => (
                  <button
                    key={img._id}
                    onClick={() => setActiveImage(img)}
                    className={`border-2 border-black bg-white ${
                      activeImage?._id === img._id ? 'ring-4 ring-black' : ''
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.seo?.altText || product.name}
                      width={160}
                      height={160}
                      className="aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INFO PANEL */}
        <aside className="lg:col-span-5">
          <div className="border-4 border-black bg-white p-6 space-y-6">
            <div className="inline-block border-4 border-black bg-pink-400 px-6 py-3 text-2xl font-black">
              ₹{product.price}
            </div>

            {product.description && (
              <p className="text-base leading-relaxed font-medium">{product.description}</p>
            )}

            {/* SIZE SELECT */}
            <div>
              <p className="font-black mb-2">SIZE</p>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s)}
                    className={`border-2 border-black px-4 py-2 font-black ${
                      selectedSize?.size === s.size ? 'bg-black text-white' : 'bg-white'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>

              {selectedSize && (
                <p className="mt-3 text-sm font-medium">
                  Width {selectedSize.width} cm · Length {selectedSize.length} cm · Height{' '}
                  {selectedSize.height} cm
                </p>
              )}
            </div>

            {/* TAGS */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="border-2 border-black px-3 py-1 text-xs font-black">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <button
              disabled={!selectedSize || product.stock === 0}
              onClick={() => {
                if (!selectedSize) return;

                addToCart(product._id, 1, selectedSize.size);
                showAddedToCart();
              }}
              className="
    w-full border-4 border-black bg-black text-white
    py-4 text-lg font-black uppercase
    hover:bg-pink-400 hover:text-black
    transition
    disabled:opacity-40 disabled:cursor-not-allowed
  "
            >
              {product.stock === 0 ? 'Out of Stock' : !selectedSize ? 'Select Size' : 'Add to Cart'}
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
