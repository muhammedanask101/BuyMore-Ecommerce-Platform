import connectDB from './db';
import Product from '@/models/Product';
import Media from '@/models/Media';
import cloudinary from '@/lib/cloudinary';
import path from 'path';

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Seeding is disabled in production');
  }

  await connectDB();

  console.log('🌱 Clearing database...');
  await Product.deleteMany({});
  await Media.deleteMany({});

  console.log('🌱 Creating products...');

  const products = await Product.insertMany([
    {
      name: 'Neobrutal Sneakers',
      slug: 'neobrutal-sneakers',
      price: 4999,
      compareAtPrice: 5999,
      currency: 'INR',
      stock: 12,
      trackInventory: true,
      shortDescription: 'Bold sneakers with brutalist design.',
      description:
        'Bold sneakers with a brutalist design aesthetic. Built for comfort, durability, and statement looks.',
      tags: ['shoes', 'sneakers', 'brutalism'],
      status: 'active',
      isFeatured: true,
      rating: { average: 4.6, count: 18 },
      deletedAt: null,
    },
    {
      name: 'Minimal Backpack',
      slug: 'minimal-backpack',
      price: 2999,
      compareAtPrice: 3499,
      currency: 'INR',
      stock: 8,
      trackInventory: true,
      shortDescription: 'Clean, functional, and durable backpack.',
      description:
        'A minimal backpack designed for everyday use. Durable materials, clean form, and thoughtful compartments.',
      tags: ['bags', 'backpack', 'minimal'],
      status: 'active',
      isFeatured: false,
      rating: { average: 4.3, count: 11 },
      deletedAt: null,
    },
    {
      name: 'Concrete Hoodie',
      slug: 'concrete-hoodie',
      price: 2499,
      currency: 'INR',
      stock: 20,
      trackInventory: true,
      shortDescription: 'Heavyweight hoodie inspired by brutalist concrete.',
      description:
        'A heavyweight hoodie inspired by brutalist concrete forms. Warm, durable, and bold.',
      tags: ['hoodie', 'apparel', 'brutalism'],
      status: 'active',
      isFeatured: true,
      rating: { average: 4.7, count: 22 },
      deletedAt: null,
    },
    {
      name: 'Utility Cargo Pants',
      slug: 'utility-cargo-pants',
      price: 2199,
      currency: 'INR',
      stock: 15,
      trackInventory: true,
      shortDescription: 'Functional cargo pants with a modern edge.',
      description:
        'Utility cargo pants designed for durability and comfort. Multiple pockets, rugged fabric, modern fit.',
      tags: ['pants', 'cargo', 'utility'],
      status: 'active',
      isFeatured: false,
      rating: { average: 4.4, count: 9 },
      deletedAt: null,
    },
  ]);

  console.log('🌱 Uploading seed images to Cloudinary & creating media...');

  const uploads = [
    { slug: 'neobrutal-sneakers', file: 'sneakers.jpg' },
    { slug: 'minimal-backpack', file: 'backpack.jpg' },
    { slug: 'concrete-hoodie', file: 'hoodie.jpg' },
    { slug: 'utility-cargo-pants', file: 'cargo.jpg' },
  ];

  for (const item of uploads) {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) continue;

    const filePath = path.join(process.cwd(), 'src/lib/seed-assets', item.file);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'products',
      resource_type: 'image',
    });

    await Media.create({
      publicId: result.public_id,
      url: result.secure_url,
      provider: 'cloudinary',
      resourceType: 'image',
      format: result.format,
      mimeType: `image/${result.format}`,
      size: result.bytes,
      width: result.width,
      height: result.height,
      ownerType: 'Product',
      ownerId: product._id,
      isPrimary: true,
      order: 0,
      visibility: 'public',
      deletedAt: null,
    });
  }

  console.log('✅ Seeded 4 products and 4 media successfully');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
