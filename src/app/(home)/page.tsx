import { Product } from '@/types/product';

async function getProducts(): Promise<Product[]> {
  const res = await fetch('http://localhost:3000/api/products', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="p-8 grid grid-cols-3 gap-6">
      {products.map((p: Product) => (
        <div key={p._id} className="border-2 border-black p-4 shadow-[4px_4px_0_0_#000]">
          <h2 className="font-bold">{p.name}</h2>
          <p>₹{p.price}</p>
        </div>
      ))}
    </main>
  );
}
