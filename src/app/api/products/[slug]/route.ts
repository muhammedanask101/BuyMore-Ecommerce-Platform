import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Media from '@/models/Media';

/* ===========================
   GET PRODUCT BY SLUG
=========================== */

export async function GET(_req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  await connectDB();

  /* ===========================
     FETCH PRODUCT
  ============================ */

  const product = await Product.findOne({
    slug,
    status: 'active',
    deletedAt: null,
  }).lean();

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  /* ===========================
     FETCH MEDIA
  ============================ */

  const media = await Media.find({
    ownerType: 'Product',
    ownerId: product._id,
    deletedAt: null,
    visibility: 'public',
  })
    .sort({ isPrimary: -1, order: 1, createdAt: 1 })
    .select('url isPrimary seo')
    .lean();

  /* ===========================
     RESPONSE
  ============================ */

  return NextResponse.json({
    ...product,
    media,
  });
}
