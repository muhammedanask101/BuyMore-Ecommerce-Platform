import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import { cookies } from 'next/headers';
import Admin from '@/models/Admin';

/* ===========================
   ADMIN AUTH
=========================== */

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  if (!sessionId) return null;

  await connectDB();
  return Admin.findById(sessionId).select('_id role isActive').lean();
}

/* ===========================
   GET MEDIA FOR OWNER
=========================== */

export async function GET(req: Request) {
  const admin = await requireAdmin();

  if (!admin || !admin.isActive || admin.role !== 'admin') {
    return NextResponse.json([], { status: 200 });
  }

  const { searchParams } = new URL(req.url);

  const ownerType = searchParams.get('ownerType');
  const ownerId = searchParams.get('ownerId');

  if (!ownerType || !ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
    return NextResponse.json([], { status: 200 });
  }

  await connectDB();

  const media = await Media.find({
    ownerType,
    ownerId,
    deletedAt: null,
  })
    .sort({ isPrimary: -1, order: 1, createdAt: 1 })
    .select('_id url isPrimary')
    .lean();

  return NextResponse.json(media);
}
