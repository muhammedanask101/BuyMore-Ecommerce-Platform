import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import Admin from '@/models/Admin';

type OwnerType = 'Product' | 'Page' | 'Category' | 'Banner';

interface CreateMediaBody {
  publicId: string;
  url: string;
  resourceType: 'image' | 'video';
  format: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  ownerType: OwnerType;
  ownerId: string;
  isPrimary?: boolean;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  if (!sessionId) return null;

  await connectDB();
  return Admin.findById(sessionId).select('_id role isActive').lean();
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin || !admin.isActive || admin.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json()) as CreateMediaBody;

  if (!body.publicId || !body.url || !body.ownerType || !body.ownerId) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(body.ownerId)) {
    return NextResponse.json({ message: 'Invalid ownerId' }, { status: 400 });
  }

  await connectDB();

  // Enforce single primary image
  if (body.isPrimary) {
    await Media.updateMany(
      {
        ownerType: body.ownerType,
        ownerId: body.ownerId,
        isPrimary: true,
      },
      { isPrimary: false }
    );
  }

  const media = await Media.create({
    publicId: body.publicId,
    url: body.url,
    provider: 'cloudinary',
    resourceType: body.resourceType,
    format: body.format,
    mimeType: body.mimeType,
    size: body.size,
    width: body.width,
    height: body.height,
    ownerType: body.ownerType,
    ownerId: body.ownerId,
    isPrimary: body.isPrimary ?? false,
    uploadedBy: admin._id,
  });

  return NextResponse.json(media, { status: 201 });
}
