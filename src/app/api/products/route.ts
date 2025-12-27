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

  const match: ProductQuery = {
    status: 'active',
    deletedAt: null,
  };

  if (minPrice) match.price = { ...match.price, $gte: Number(minPrice) };
  if (maxPrice) match.price = { ...match.price, $lte: Number(maxPrice) };

  const sortMap: Record<SortKey, Record<string, 1 | -1>> = {
    curated: { isFeatured: -1, createdAt: -1 },
    trending: { 'rating.count': -1 },
    hot_and_new: { createdAt: -1 },
  };

  const sort = sortMap[sortParam] ?? sortMap.curated;

  const results = await Product.aggregate([
    { $match: match },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit + 1 },

    {
      $lookup: {
        from: 'media',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$ownerType', 'Product'] },
                  { $eq: ['$ownerId', '$$productId'] },
                  { $eq: ['$isPrimary', true] },
                  { $eq: ['$deletedAt', null] },
                ],
              },
            },
          },
          {
            $project: {
              url: 1,
              'seo.altText': 1,
            },
          },
          { $limit: 1 },
        ],
        as: 'primaryMedia',
      },
    },

    {
      $addFields: {
        primaryImage: { $arrayElemAt: ['$primaryMedia.url', 0] },
        primaryImageAlt: {
          $arrayElemAt: ['$primaryMedia.seo.altText', 0],
        },
      },
    },

    {
      $project: {
        primaryMedia: 0,
      },
    },
  ]);

  const hasNextPage = results.length > limit;
  const docs = hasNextPage ? results.slice(0, limit) : results;

  return NextResponse.json({
    docs,
    nextPage: hasNextPage ? page + 1 : null,
  });
}
