import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

type SortKey = 'curated' | 'trending' | 'hot_and_new';

type PriceRangeQuery = {
  $gte?: number;
  $lte?: number;
};

type ProductQuery = {
  status: 'active';
  deletedAt: null;
  price?: PriceRangeQuery;
};

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 8);

  const skip = (page - 1) * limit;

  const sortParam = (searchParams.get('sort') as SortKey) || 'curated';

  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const query: ProductQuery = {
    status: 'active',
    deletedAt: null,
  };

  if (minPrice) query.price = { ...query.price, $gte: Number(minPrice) };
  if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };

  const sortMap: Record<SortKey, Record<string, 1 | -1>> = {
    curated: { isFeatured: -1, createdAt: -1 },
    trending: { 'rating.count': -1 },
    hot_and_new: { createdAt: -1 },
  };

  const sort = sortMap[sortParam] ?? sortMap.curated;

  const docs = await Product.find(query).sort(sort).skip(skip).limit(limit);

  const hasNextPage = docs.length === limit;

  return NextResponse.json({
    docs,
    nextPage: hasNextPage ? page + 1 : null,
  });
}
