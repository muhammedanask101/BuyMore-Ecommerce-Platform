'use client';

type Props = {
  orderId: string;
};

export function RequestRefundButton({ orderId }: Props) {
  return (
    <form
      action="/api/orders/request-refund"
      method="POST"
      onSubmit={(e) => {
        if (!confirm('Request refund for this order?')) {
          e.preventDefault();
        }
      }}
      className="mt-4"
    >
      <input type="hidden" name="orderId" value={orderId} />

      <button className="border-2 border-black px-4 py-2 bg-white hover:bg-red-600 hover:text-white transition">
        Request Refund
      </button>
    </form>
  );
}
