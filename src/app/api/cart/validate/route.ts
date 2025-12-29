import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

type CartItemInput = {
  productId: string;
  variantId?: string;
  quantity: number;
};

type CartValidateRequest = {
  items: CartItemInput[];
};

export async function POST(req: Request) {
  await connectDB();

  let body: CartValidateRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const validatedItems = [];
  let total = 0;

  for (const item of body.items) {
    if (
      typeof item.productId !== 'string' ||
      typeof item.quantity !== 'number' ||
      item.quantity <= 0
    ) {
      return NextResponse.json({ error: 'Invalid cart item format' }, { status: 400 });
    }

    const product = await Product.findById(item.productId)
      .select('_id name price stock currency')
      .lean();

    if (!product) {
      validatedItems.push({
        productId: item.productId,
        name: 'Product not found',
        price: 0,
        quantity: item.quantity,
        subtotal: 0,
        inStock: false,
      });
      continue;
    }

    const inStock = product.stock >= item.quantity;
    const subtotal = inStock ? product.price * item.quantity : 0;

    if (inStock) {
      total += subtotal;
    }

    validatedItems.push({
      productId: product._id.toString(),
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal,
      inStock,
    });
  }

  return NextResponse.json({
    items: validatedItems,
    total,
    currency: 'INR',
  });
}
