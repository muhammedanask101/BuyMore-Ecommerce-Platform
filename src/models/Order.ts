import mongoose, { Schema, Types } from 'mongoose';

/* ===========================
   ORDER ITEM (IMMUTABLE SNAPSHOT)
=========================== */

const OrderItemSchema = new Schema(
  {
    productId: {
      type: Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL'],
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

/* ===========================
   MAIN ORDER SCHEMA
=========================== */

const OrderSchema = new Schema(
  {
    /* ===== Ownership ===== */

    userId: {
      type: Types.ObjectId,
      ref: 'User',
      index: true,
      default: null, // supports guest checkout
    },

    /* ===== Items ===== */

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: unknown[]) => v.length > 0, 'Order must contain items'],
    },

    /* ===== Pricing (SERVER AUTHORITY) ===== */

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    /* ===== Order Lifecycle ===== */

    status: {
      type: String,
      enum: [
        'pending', // created, unpaid
        'paid', // payment confirmed
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
      index: true,
    },

    /* ===== Payment ===== */

    paymentProvider: {
      type: String,
      enum: ['stripe', 'razorpay', 'cod', null],
      default: null,
    },

    paymentIntentId: {
      type: String,
      index: true,
    },

    paidAt: {
      type: Date,
    },
    guestId: {
      type: String,
      index: true,
    },

    /* ===== Shipping ===== */

    shippingAddress: {
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },

    /* ===== Soft delete / audit ===== */

    cancelledAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

/* ===========================
   INDEXES
=========================== */

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

/* ===========================
   EXPORT
=========================== */

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
