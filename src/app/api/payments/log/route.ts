import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { logPayment } from '@/lib/payments/logPayment';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  await logPayment(body);

  return NextResponse.json({ ok: true });
}
