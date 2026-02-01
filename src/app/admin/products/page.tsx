export const dynamic = 'force-dynamic';

import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Media from '@/models/Media';
import cloudinary from '@/lib/cloudinary';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import DeleteProductButton from '@/components/custom/DeleteProduct';

/* ===========================
   SERVER ACTION
=========================== */

async function deleteProduct(formData: FormData) {
  'use server';

  const id = formData.get('id') as string;
  if (!id) return;

  await connectDB();

  const media = await Media.find({
    ownerType: 'Product',
    ownerId: id,
  });

  for (const m of media) {
    await cloudinary.uploader.destroy(m.publicId, {
      resource_type: m.resourceType,
    });
  }

  await Media.deleteMany({
    ownerType: 'Product',
    ownerId: id,
  });

  await Product.findByIdAndDelete(id);

  revalidatePath('/admin/products');
}

/* ===========================
   PAGE
=========================== */

export default async function AdminProductsPage() {
  await connectDB();

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .select('name price stock status')
    .lean();

  return (
    <div className="space-y-6">
      <div className="border-4 border-black bg-white p-6 space-y-4">
        {/* Back row */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium underline lg:hidden"
        >
          ← Back
        </Link>

        {/* Title + action row */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-extrabold">Products</h1>

          <Link
            href="/admin/products/new"
            className="
        border-2 border-black
        px-4 py-2
        bg-black text-white
        text-sm font-medium
        hover:bg-white hover:text-black
        transition
      "
          >
            + New Product
          </Link>
        </div>
      </div>

      <div className="border-4 border-black bg-white overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="border-b-4 border-black">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id.toString()} className="border-b-2 border-black">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-center">₹{p.price}</td>
                <td className="px-4 py-3 text-center">{p.stock}</td>
                <td className="px-4 py-3 text-center">{p.status}</td>

                <td className="px-4 py-3 flex gap-4 justify-center">
                  <Link href={`/admin/products/${p._id}/edit`} className="underline">
                    Edit
                  </Link>

                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={p._id.toString()} />
                    <DeleteProductButton />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
