export const dynamic = 'force-dynamic';

import Link from 'next/link';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import MediaTable from '@/components/custom/MediaTable';

export default async function AdminMediaPage() {
  await connectDB();

  const media = await Media.find({ deletedAt: null })
    .sort({ createdAt: -1 })
    .select('url ownerType ownerId resourceType format isPrimary createdAt')
    .lean();

  return (
    <div className="space-y-6">
      <div className="border-4 border-black bg-white p-6 space-y-3">
        {/* Mobile back button */}
        <Link
          href="/admin"
          className="lg:hidden inline-flex items-center gap-2 text-sm font-medium underline"
        >
          ← Back
        </Link>

        <div>
          <h1 className="text-2xl font-extrabold">Media Library</h1>
          <p className="text-sm opacity-70">All uploaded assets</p>
        </div>
      </div>
      <MediaTable
        media={media.map((m) => ({
          ...m,
          _id: m._id.toString(),
          ownerId: m.ownerId.toString(),
        }))}
      />
    </div>
  );
}
