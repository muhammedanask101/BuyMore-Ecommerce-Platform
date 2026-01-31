// src/app/admin/media/page.tsx
export const dynamic = 'force-dynamic';

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
      <div className="border-4 border-black bg-white p-6">
        <h1 className="text-2xl font-extrabold">Media Library</h1>
        <p className="text-sm opacity-70">All uploaded assets</p>
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
