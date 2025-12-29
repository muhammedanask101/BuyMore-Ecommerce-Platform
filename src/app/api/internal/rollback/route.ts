import { NextResponse } from 'next/server';
import { rollbackExpiredPendingOrders } from '@/lib/rollbackPendingOrders';

export const runtime = 'nodejs'; // important for DB + crypto safety

export async function POST() {
  try {
    const result = await rollbackExpiredPendingOrders();

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rollback failed',
      },
      { status: 500 }
    );
  }
}
