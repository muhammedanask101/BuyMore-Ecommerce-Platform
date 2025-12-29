import { CreateOrderRequest, CreateOrderResponse } from '@/types/checkout';

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  const res = await fetch('/api/orders/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create order');
  }

  return data as CreateOrderResponse;
}
