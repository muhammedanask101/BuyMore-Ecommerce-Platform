import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Media from '@/models/Media';

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

export async function POST(req: Request) {
  await connectDB();

  const body = (await req.json()) as CreateMediaBody;

  if (!body.publicId || !body.url || !body.ownerType || !body.ownerId) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

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
  });

  return NextResponse.json(media, { status: 201 });
}
