import { connectDB } from './db';
import Product from '@/models/Product';

async function seed() {
  await connectDB();

  await Product.deleteMany();

  await Product.insertMany([
    {
      name: 'Neobrutal Sneakers',
      price: 4999,
      stock: 10,
      description: 'Bold sneakers with brutalist design.',
    },
    {
      name: 'Minimal Backpack',
      price: 2999,
      stock: 5,
      description: 'Clean, functional, durable.',
    },
  ]);

  console.log('Seeded products');
  process.exit();
}

seed();
