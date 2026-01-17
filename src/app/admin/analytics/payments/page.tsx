import connectDB from '@/lib/db';
import PaymentLog from '@/models/PaymentLog';

export default async function PaymentAnalyticsPage() {
  await connectDB();

  const stats = await PaymentLog.aggregate([
    {
      $group: {
        _id: { provider: '$provider', event: '$event' },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Payment Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((row) => (
          <div
            key={`${row._id.provider}-${row._id.event}`}
            className="border-4 border-black bg-white p-4"
          >
            <p className="text-xs uppercase opacity-60">
              {row._id.provider} · {row._id.event}
            </p>
            <p className="text-2xl font-extrabold mt-2">{row.count}</p>
            <p className="text-sm mt-1">₹{row.totalAmount ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
