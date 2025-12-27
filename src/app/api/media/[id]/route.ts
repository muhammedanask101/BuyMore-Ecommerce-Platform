import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import cloudinary from '@/lib/cloudinary';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import Admin from '@/models/Admin';

/* ===========================
   ADMIN AUTH (SERVER-ONLY)
=========================== */

async function requireAdmin() {
  const cookieStore = await cookies(); // ❗ DO NOT await
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) return null;

  await connectDB();

  return Admin.findById(sessionId).select('_id role isActive').lean();
}

/* ===========================
   DELETE MEDIA
=========================== */

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params is async
) {
  const { id } = await params; // ✅ REQUIRED in Next.js 15+

  const admin = await requireAdmin();

  if (!admin || !admin.isActive || admin.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid media id' }, { status: 400 });
  }

  await connectDB();

  const media = await Media.findById(id);

  if (!media) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  /* ===========================
     1️⃣ DELETE FROM CLOUDINARY
  ============================ */

  await cloudinary.uploader.destroy(media.publicId, {
    resource_type: media.resourceType,
  });

  /* ===========================
     2️⃣ DELETE FROM DB
  ============================ */

  const wasPrimary = media.isPrimary;
  const ownerType = media.ownerType;
  const ownerId = media.ownerId;

  await media.deleteOne();

  /* ===========================
     3️⃣ FIX PRIMARY IMAGE
  ============================ */

  if (wasPrimary) {
    const next = await Media.findOne({
      ownerType,
      ownerId,
    }).sort({ order: 1, createdAt: 1 });

    if (next) {
      next.isPrimary = true;
      await next.save();
    }
  }

  return NextResponse.json({ success: true });
}
