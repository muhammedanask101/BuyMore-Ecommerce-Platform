import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { cookies } from 'next/headers';
import Admin from '@/models/Admin';

/* ============================
   HELPERS
============================ */

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) return false;

  await connectDB();

  const admin = await Admin.findById(sessionId).select('_id role isActive').lean();

  return !!admin && admin.isActive && admin.role === 'admin';
}

/* ============================
   GET: list products (admin)
============================ */

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .select('name price stock status isFeatured createdAt')
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

  if (!body.name || typeof body.price !== 'number') {
    return NextResponse.json({ message: 'Name and price are required' }, { status: 400 });
  }

  await connectDB();

  const slug = body.slug?.trim() || slugify(body.name);

  const description = body.description?.trim();
  const shortDescription = body.shortDescription?.trim() || description?.slice(0, 120);

  const tags =
    typeof body.tags === 'string'
      ? body.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : (body.tags ?? []);

  const seo = {
    title: `${body.name} | Kapithan`,
    description: shortDescription || description?.slice(0, 160),
  };

  const product = await Product.create({
    name: body.name,
    slug,
    price: body.price,
    compareAtPrice: body.compareAtPrice,
    stock: body.stock ?? 0,
    status: body.status ?? 'draft',
    isFeatured: body.isFeatured ?? false,
    description,
    shortDescription,
    tags,
    seo,
  });

  return NextResponse.json(product, { status: 201 });
}
