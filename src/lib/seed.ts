import connectDB from './db';
import Product from '@/models/Product';

async function seed() {
  await connectDB();

  // ⚠️ DEV ONLY: wipe products
  await Product.deleteMany({});

  const products = [
    {
      name: 'Neobrutal Sneakers',
      slug: 'neobrutal-sneakers',
      price: 4999,
      compareAtPrice: 5999,
      currency: 'INR',

      stock: 10,
      trackInventory: true,

      shortDescription: 'Bold sneakers with brutalist design.',
      description:
        'Bold sneakers with a brutalist design aesthetic. Built for comfort, durability, and statement looks.',

      images: [
        {
          url: '/images/neobrutal-sneakers.jpg',
          alt: 'Neobrutal sneakers',
        },
      ],

      tags: ['shoes', 'sneakers', 'brutalism'],
      status: 'active',
      isFeatured: true,

      seo: {
        title: 'Neobrutal Sneakers | Kapithan',
        description:
          'Bold neobrutal sneakers designed for comfort and style. Buy now from Kapithan.',
      },

      rating: {
        average: 4.5,
        count: 12,
      },

      deletedAt: null,
    },
    {
      name: 'Minimal Backpack',
      slug: 'minimal-backpack',
      price: 2999,
      compareAtPrice: 3499,
      currency: 'INR',

      stock: 5,
      trackInventory: true,

      shortDescription: 'Clean, functional, and durable backpack.',
      description:
        'A minimal backpack designed for everyday use. Durable materials, clean form, and thoughtful compartments.',

      images: [
        {
          url: '/images/minimal-backpack.jpg',
          alt: 'Minimal backpack',
        },
      ],

      tags: ['bags', 'backpack', 'minimal'],
      status: 'active',
      isFeatured: false,

      seo: {
        title: 'Minimal Backpack | Kapithan',
        description: 'Minimal and durable backpack for everyday carry. Order now from Kapithan.',
      },

      rating: {
        average: 4.2,
        count: 8,
      },

      deletedAt: null,
    },
  ];

  await Product.insertMany(products);

  console.log(`Seeded ${products.length} products`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
