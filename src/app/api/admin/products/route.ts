import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { cookies } from 'next/headers';
import Admin from '@/models/Admin';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) {
    return false;
  }

  await connectDB();

  const admin = await Admin.findById(sessionId).select('_id role isActive').lean();

  return !!admin && admin.isActive && admin.role === 'admin';
}

/* ============================
   GET: list products
============================ */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .select('name price status stock isFeatured createdAt')
    .lean();

  return NextResponse.json(products);
}

/* ============================
   POST: create product
============================ */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const product = await Product.create({
    name: body.name,
    slug: body.slug,
    price: body.price,
    stock: body.stock ?? 0,
    status: body.status ?? 'draft',
  });

  return NextResponse.json(product, { status: 201 });
}
