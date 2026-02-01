import mongoose, { Schema } from 'mongoose';

const LoginAttemptSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      index: true, // ip:1.2.3.4 OR email:test@x.com
    },
    count: {
      type: Number,
      default: 1,
    },
    blockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', LoginAttemptSchema);
