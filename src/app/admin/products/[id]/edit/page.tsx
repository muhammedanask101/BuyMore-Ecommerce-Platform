import { use } from 'react';
import EditProduct from '@/components/custom/EditProduct';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ THIS IS THE FIX

  return <EditProduct id={id} />;
}
