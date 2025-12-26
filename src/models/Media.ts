import mongoose, { Schema, Types } from 'mongoose';

const MediaSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    provider: {
      type: String,
      enum: ['cloudinary'],
      default: 'cloudinary',
      immutable: true,
    },

    resourceType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
      index: true,
    },

    format: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
      index: true,
    },

    size: {
      type: Number,
      required: true,
      min: 0,
    },

    checksum: {
      type: String,
      select: false,
      index: true,
    },

    width: {
      type: Number,
      min: 0,
    },

    height: {
      type: Number,
      min: 0,
    },

    duration: {
      type: Number,
      min: 0,
    },

    seo: {
      altText: {
        type: String,
        maxlength: 125,
        index: true,
      },

      title: {
        type: String,
        maxlength: 70,
      },

      caption: {
        type: String,
        maxlength: 300,
      },

      description: {
        type: String,
        maxlength: 160,
      },

      keywords: {
        type: [String],
        index: true,
      },
    },

    ownerType: {
      type: String,
      enum: ['Product', 'Page', 'Category', 'Banner'],
      required: true,
      index: true,
    },

    ownerId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },

    uploadedBy: {
      type: Types.ObjectId,
      ref: 'Admin',
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

MediaSchema.index(
  { ownerType: 1, ownerId: 1, isPrimary: 1 },
  { partialFilterExpression: { isPrimary: true } }
);

MediaSchema.index({ ownerType: 1, ownerId: 1, order: 1 });

MediaSchema.index({ 'seo.keywords': 1 });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
