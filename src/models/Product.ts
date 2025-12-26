import mongoose, { Schema, Types } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      enum: ['INR'],
      default: 'INR',
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    trackInventory: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      maxlength: 5000,
    },

    shortDescription: {
      type: String,
      maxlength: 300,
    },

    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],

    categories: [
      {
        type: Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],

    tags: {
      type: [String],
      index: true,
    },

    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    weight: {
      type: Number,
      min: 0,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: 'Admin',
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },

    seo: {
      title: {
        type: String,
        maxlength: 70,
      },
      description: {
        type: String,
        maxlength: 160,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ProductSchema.index({ status: 1, createdAt: -1 });

ProductSchema.virtual('primaryImage').get(function () {
  return this.images?.[0]?.url ?? null;
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
