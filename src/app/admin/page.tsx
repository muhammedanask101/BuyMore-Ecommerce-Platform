import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10">
      <section className="border-4 border-black bg-white p-6">
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="mt-1 text-sm opacity-70">Store control center</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <a
          href="/admin/products"
          className="border-4 border-black bg-white p-6 hover:bg-black hover:text-white transition"
        >
          <h2 className="text-xl font-extrabold mb-2">Manage Products</h2>
          <p className="text-sm opacity-80">Create, edit, and publish products</p>
        </a>

        <a
          href="/admin/media"
          className="border-4 border-black bg-white p-6 hover:bg-black hover:text-white transition"
        >
          <h2 className="text-xl font-extrabold mb-2">Media Library</h2>
          <p className="text-sm opacity-80">Upload and organize images</p>
        </a>
      </section>
    </div>
  );
}
