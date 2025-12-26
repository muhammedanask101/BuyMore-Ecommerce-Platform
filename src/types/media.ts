import { Types } from 'mongoose';

export type MediaProvider = 'cloudinary';

export type MediaResourceType = 'image' | 'video';

export type MediaOwnerType = 'Product' | 'Page' | 'Category' | 'Banner';

export type MediaVisibility = 'public' | 'private';

export interface MediaSEO {
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
  keywords?: string[];
}

export interface Media {
  _id: Types.ObjectId;
  publicId: string;
  url: string;
  provider: MediaProvider;
  resourceType: MediaResourceType;
  format: string;
  mimeType: string;
  size: number;
  checksum?: string;
  width?: number;
  height?: number;
  duration?: number;
  seo?: MediaSEO;
  ownerType: MediaOwnerType;
  ownerId: Types.ObjectId;
  isPrimary: boolean;
  order: number;
  visibility: MediaVisibility;
  uploadedBy?: Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
