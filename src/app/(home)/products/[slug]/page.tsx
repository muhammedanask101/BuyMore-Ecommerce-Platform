import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Script from 'next/script';

import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Media from '@/models/Media';

import ProductClient from '@/components/custom/ProductClient';
import type { ProductPageDTO, MediaDTO } from '@/types/product-page';

/* ===========================
   PAGE
=========================== */

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await connectDB();

  const productDoc = await Product.findOne({
    slug,
    status: 'active',
    deletedAt: null,
  }).lean();

  if (!productDoc) notFound();

  const mediaDocs = await Media.find({
    ownerType: 'Product',
    ownerId: productDoc._id,
    deletedAt: null,
    visibility: 'public',
  })
    .sort({ isPrimary: -1, order: 1 })
    .lean();

  const media: MediaDTO[] = mediaDocs.map((m) => ({
    _id: String(m._id),
    url: m.url,
    isPrimary: Boolean(m.isPrimary),
    seo: m.seo
      ? {
          altText: m.seo.altText,
        }
      : undefined,
  }));

  const product: ProductPageDTO = {
    _id: String(productDoc._id),
    name: productDoc.name,
    slug: productDoc.slug,
    price: productDoc.price,
    currency: productDoc.currency,
    stock: productDoc.stock,
    description: productDoc.description,
    shortDescription: productDoc.shortDescription,
    tags: productDoc.tags,
    rating: productDoc.rating,
    seo: productDoc.seo,
    media,
    sizes: productDoc.sizes, // optional, handled safely by client
  };

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductClient product={product} />
    </>
  );
}

/* ===========================
   SEO METADATA
=========================== */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  await connectDB();

  const product = await Product.findOne({
    slug,
    status: 'active',
    deletedAt: null,
  }).lean();

  if (!product) {
    return {
      title: 'Product not found',
      robots: { index: false },
    };
  }

  const primaryMedia = await Media.findOne({
    ownerType: 'Product',
    ownerId: product._id,
    isPrimary: true,
    deletedAt: null,
  }).lean();

  const title = product.seo?.title ?? `${product.name} | Kapithan`;
  const description =
    product.seo?.description ??
    product.shortDescription ??
    product.description ??
    `Buy ${product.name} online`;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: 'website',
      title,
      description,
      images: primaryMedia
        ? [
            {
              url: primaryMedia.url,
              width: 1200,
              height: 1200,
              alt: primaryMedia.seo?.altText ?? product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryMedia?.url ? [primaryMedia.url] : [],
    },
  };
}

/* ===========================
   JSON-LD
=========================== */

function ProductJsonLd({ product }: { product: ProductPageDTO }) {
  const primaryImage = product.media.find((m) => m.isPrimary)?.url;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: primaryImage ? [primaryImage] : [],
    description: product.shortDescription ?? product.description,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'Kapithan',
    },
    offers: {
      '@type': 'Offer',
      url: `https://kapithan.com/products/${product.slug}`,
      priceCurrency: product.currency ?? 'INR',
      price: product.price,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating:
      product.rating && product.rating.count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.average,
            reviewCount: product.rating.count,
          }
        : undefined,
  };

  return (
    <Script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd),
      }}
    />
  );
}
