'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type ProductStatus = 'draft' | 'active' | 'archived';

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number | ''>('');
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCreating(true);

    const safeStock = typeof stock === 'number' && stock > 0 ? stock : 1;

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        price,
        stock: safeStock,
        status,
      }),
    });

    if (!res.ok) {
      alert('Failed to create product');
      setCreating(false);
      return;
    }

    const product = await res.json();

    // ➜ Go to edit page to add media, SEO, etc.
    router.push(`/admin/products/${product._id}/edit`);
  }

  return (
    <div className="max-w-2xl">
      {/* BACK BUTTON */}
      <button type="button" onClick={() => router.back()} className="text-sm underline">
        ← Back
      </button>
      <form onSubmit={handleSubmit} className="border-4 border-black bg-white p-6 space-y-4">
        <h1 className="text-2xl font-extrabold">New Product</h1>
        <p className="text-sm opacity-70">Create the product first, then add images and details</p>

        <input
          className="border-2 border-black px-3 py-2 w-full"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border-2 border-black px-3 py-2"
            placeholder="Price"
            value={price || ''}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
          />

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="border-2 border-black px-3 py-2"
            placeholder="Stock"
            value={stock}
            onChange={(e) => {
              const v = e.target.value;
              setStock(v === '' ? '' : Number(v));
            }}
          />
        </div>

        <select
          className="border-2 border-black px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <button
          disabled={creating}
          className="
            border-2 border-black
            bg-black text-white
            px-4 py-2
            font-medium
            hover:bg-white hover:text-black
            transition
            disabled:opacity-50
          "
        >
          {creating ? 'Creating…' : 'Create & Add Media →'}
        </button>
      </form>
    </div>
  );
}
