'use client';

type Props = {
  orderId: string;
};

export function CancelOrderButton({ orderId }: Props) {
  return (
    <form
      action="/api/orders/request-refund"
      method="POST"
      onSubmit={(e) => {
        if (!confirm('Cancel this unpaid order?')) {
          e.preventDefault();
        }
      }}
      className="mt-4"
    >
      <input type="hidden" name="orderId" value={orderId} />

      <button className="border-2 border-black px-4 py-2 bg-white hover:bg-black hover:text-white transition">
        Cancel Order
      </button>
    </form>
  );
}
