'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type ProductStatus = 'draft' | 'active' | 'archived';

type InitialProduct = {
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: ProductStatus;
};

export default function EditProductForm({ id, initial }: { id: string; initial: InitialProduct }) {
  const router = useRouter();

  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [price, setPrice] = useState(initial.price);
  const [stock, setStock] = useState(initial.stock);
  const [status, setStatus] = useState<ProductStatus>(initial.status);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, price, stock, status }),
    });

    setSaving(false);

    if (res.ok) {
      router.push('/admin/products');
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-4 border-black bg-white p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-extrabold">Edit Product</h1>

      <TextInput label="Name" value={name} onChange={setName} />
      <TextInput label="Slug" value={slug} onChange={setSlug} />
      <NumberInput label="Price" value={price} onChange={setPrice} />
      <NumberInput label="Stock" value={stock} onChange={setStock} />

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          className="w-full border-2 border-black px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="border-2 border-black px-4 py-2 font-medium bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </form>
  );
}

/* ============================
   Inputs
============================ */

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full border-2 border-black px-3 py-2"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="w-full border-2 border-black px-3 py-2"
      />
    </div>
  );
}
