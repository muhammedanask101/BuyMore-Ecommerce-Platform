import Media from '@/models/Media';

export async function getPrimaryProductMedia(productId: string) {
  return Media.findOne({
    ownerType: 'Product',
    ownerId: productId,
    isPrimary: true,
    deletedAt: null,
    visibility: 'public',
  })
    .select('url width height seo.altText')
    .lean();
}
