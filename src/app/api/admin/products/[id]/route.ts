import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import Admin from '@/models/Admin';
import slugify from 'slugify';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  if (!sessionId) return false;

  await connectDB();
  const admin = await Admin.findById(sessionId).select('_id role isActive').lean();

  return !!admin && admin.isActive && admin.role === 'admin';
}

/* ============================
   GET product by id
============================ */
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  await connectDB();
  const product = await Product.findById(id).lean();

  if (!product) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

/* ============================
   PATCH product (AUTO LOGIC)
============================ */
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  const body = (await req.json()) as {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    tags?: string[];
    isFeatured?: boolean;
    price?: number;
    stock?: number;
    status?: 'draft' | 'active' | 'archived';
  };

  const updates: typeof body & {
    seo?: { title?: string; description?: string };
  } = { ...body };

  /* ---------- AUTO SLUG ---------- */
  if (!updates.slug && updates.name) {
    updates.slug = slugify(updates.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  /* ---------- AUTO SHORT DESCRIPTION ---------- */
  if (!updates.shortDescription && updates.description) {
    updates.shortDescription = updates.description.slice(0, 160);
  }

  /* ---------- CLEAN TAGS ---------- */
  if (updates.tags) {
    updates.tags = updates.tags.map((t) => t.trim()).filter(Boolean);
  }

  /* ---------- AUTO SEO ---------- */
  updates.seo = {
    title: updates.name?.slice(0, 70),
    description: updates.shortDescription?.slice(0, 160) ?? updates.description?.slice(0, 160),
  };

  await connectDB();

  const updated = await Product.findByIdAndUpdate(id, updates, {
    new: true,
  }).lean();

  return NextResponse.json(updated);
}

/* ============================
   DELETE product
============================ */
export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 });
  }

  await connectDB();
  await Product.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
