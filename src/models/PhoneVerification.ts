import mongoose, { Schema } from 'mongoose';

/* ===========================
   PHONE VERIFICATION (OTP)
=========================== */

const PhoneVerificationSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===========================
   AUTO-CLEANUP (TTL)
=========================== */

PhoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PhoneVerification ||
  mongoose.model('PhoneVerification', PhoneVerificationSchema);
