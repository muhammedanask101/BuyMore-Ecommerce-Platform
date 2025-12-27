'use client';

import { useEffect, useState, FormEvent, useRef } from 'react';
import Image from 'next/image';

type Product = {
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: 'draft' | 'active' | 'archived';
};

type Media = {
  _id: string;
  url: string;
};

export default function EditProductClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  /* ===========================
     FETCH PRODUCT + MEDIA
  ============================ */

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    (async () => {
      const [pRes, mRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`, { cache: 'no-store' }),
        fetch(`/api/admin/media?ownerType=Product&ownerId=${id}`, {
          cache: 'no-store',
        }),
      ]);

      if (!pRes.ok || !mRes.ok) return;

      const p = await pRes.json();
      const m = await mRes.json();

      if (!cancelled) {
        setProduct(p);
        setMedia(m);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* ===========================
     SAVE PRODUCT DETAILS
  ============================ */

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!product) return;

    setSaving(true);

    await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    setSaving(false);
    alert('Product saved');
  }

  /* ===========================
     DELETE MEDIA
  ============================ */

  async function handleDelete(mediaId: string) {
    if (!confirm('Delete this image?')) return;

    const res = await fetch(`/api/media/${mediaId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      alert('Failed to delete');
      return;
    }

    setMedia((prev) => prev.filter((m) => m._id !== mediaId));
  }

  /* ===========================
     UPLOAD MEDIA
  ============================ */

  async function handleUpload(file: File) {
    setUploading(true);

    try {
      // 1️⃣ Cloudinary signature
      const sig = await fetch('/api/cloudinary/sign', {
        method: 'POST',
      }).then((r) => r.json());

      // 2️⃣ Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', sig.timestamp.toString());
      formData.append('signature', sig.signature);

      const uploaded = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      ).then((r) => r.json());

      // 3️⃣ Save media in DB
      await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: uploaded.public_id,
          url: uploaded.secure_url,

          resourceType: uploaded.resource_type,
          format: uploaded.format,
          mimeType: `image/${uploaded.format}`,

          size: uploaded.bytes,
          width: uploaded.width,
          height: uploaded.height,

          ownerType: 'Product',
          ownerId: id,
          isPrimary: media.length === 0,
        }),
      });

      // 4️⃣ Refresh media
      const refreshed = await fetch(`/api/admin/media?ownerType=Product&ownerId=${id}`, {
        cache: 'no-store',
      }).then((r) => r.json());

      setMedia(refreshed);
    } finally {
      setUploading(false);

      // ✅ Clear file input safely
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }

  if (!product) return <p>Loading…</p>;

  /* ===========================
     RENDER
  ============================ */

  return (
    <div className="space-y-10">
      {/* PRODUCT FORM */}
      <form
        onSubmit={handleSave}
        className="border-4 border-black bg-white p-6 space-y-4 max-w-2xl"
      >
        <h1 className="text-2xl font-extrabold">Edit Product</h1>

        <input
          className="border-2 border-black px-3 py-2 w-full"
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          placeholder="Name"
        />

        <input
          className="border-2 border-black px-3 py-2 w-full"
          value={product.slug}
          onChange={(e) => setProduct({ ...product, slug: e.target.value })}
          placeholder="Slug"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            className="border-2 border-black px-3 py-2"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            placeholder="Price"
          />

          <input
            type="number"
            className="border-2 border-black px-3 py-2"
            value={product.stock}
            onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
            placeholder="Stock"
          />
        </div>

        <select
          className="border-2 border-black px-3 py-2"
          value={product.status}
          onChange={(e) =>
            setProduct({
              ...product,
              status: e.target.value as Product['status'],
            })
          }
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <button disabled={saving} className="border-2 border-black bg-black text-white px-4 py-2">
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </form>

      {/* MEDIA MANAGER */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">Media</h2>

        <div className="border-4 border-black bg-white p-4 space-y-3">
          <input ref={fileRef} type="file" accept="image/*" disabled={uploading} />

          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              const file = fileRef.current?.files?.[0];
              if (!file) {
                alert('Please choose a file first');
                return;
              }
              handleUpload(file);
            }}
            className="border-2 border-black bg-black text-white px-4 py-2"
          >
            {uploading ? 'Uploading…' : 'Upload Image'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m._id} className="relative border-4 border-black bg-white">
              <Image
                src={m.url}
                alt=""
                width={300}
                height={300}
                className="object-cover aspect-square"
              />

              <button
                onClick={() => handleDelete(m._id)}
                className="
                  absolute top-1 right-1
                  border-2 border-black
                  bg-white
                  px-2 py-1
                  text-xs font-bold
                  hover:bg-black hover:text-white
                "
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
