import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Media from '@/models/Media';
import { cookies } from 'next/headers';
import Admin from '@/models/Admin';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;
  if (!sessionId) return null;

  await connectDB();
  return Admin.findById(sessionId).select('_id isActive role').lean();
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin || !admin.isActive || admin.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
  }

  const body = await req.json();

  const media = await Media.create({
    publicId: body.publicId,
    url: body.url,
    provider: 'cloudinary',
    resourceType: 'image',
    format: body.format,
    mimeType: body.mimeType,
    size: body.size,
    width: body.width,
    height: body.height,
    ownerType: 'Product',
    ownerId: params.id,
    uploadedBy: admin._id,
    isPrimary: body.isPrimary ?? false,
  });

  return NextResponse.json(media, { status: 201 });
}
