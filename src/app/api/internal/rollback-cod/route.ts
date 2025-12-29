import { rollbackExpiredCodOrders } from '@/lib/rollbackCodOrders';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await rollbackExpiredCodOrders();
  return Response.json(result);
}
