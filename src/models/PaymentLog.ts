import mongoose, { Schema, Types } from 'mongoose';

const PaymentLogSchema = new Schema(
  {
    orderId: {
      type: Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ['razorpay', 'cod'],
      required: true,
      index: true,
    },

    event: {
      type: String,
      enum: [
        'payment_attempted',
        'payment_failed',
        'payment_success',
        'refund_requested',
        'refund_approved',
        'refund_rejected',
        'refund_processed',
        'order_cancelled',
      ],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    metadata: {
      type: Schema.Types.Mixed,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    webhookEventId: String,
  },
  { versionKey: false }
);

export default mongoose.models.PaymentLog || mongoose.model('PaymentLog', PaymentLogSchema);
