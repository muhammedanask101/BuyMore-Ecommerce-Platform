'use client';

type Props = {
  orderId: string;
};

export function ApproveRefundButton({ orderId }: Props) {
  return (
    <form
      action="/api/admin/orders/approve-refund"
      method="POST"
      onSubmit={(e) => {
        if (!confirm('Approve refund and restore stock?')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />

      <button className="border-2 border-black px-6 py-2 bg-red-600 text-white hover:bg-white hover:text-black transition">
        Approve Refund
      </button>
    </form>
  );
}
