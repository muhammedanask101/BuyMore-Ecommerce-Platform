'use client';

export default function DeleteProductButton() {
  return (
    <button
      type="submit"
      className="text-red-600 underline"
      onClick={(e) => {
        if (!confirm('Delete this product permanently?')) {
          e.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
