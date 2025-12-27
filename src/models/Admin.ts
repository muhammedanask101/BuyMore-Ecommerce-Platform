import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type AdminRole = 'admin' | 'editor';

export interface AdminDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  verifyPassword(password: string): Promise<boolean>;
}

export interface AdminModel extends Model<AdminDocument> {
  hashPassword(password: string): Promise<string>;
}

const AdminSchema = new Schema<AdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // 🔐 NEVER return by default
    },

    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'admin',
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ========================= */
/* Instance methods          */
/* ========================= */

AdminSchema.methods.verifyPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

/* ========================= */
/* Static helpers (optional) */
/* ========================= */

AdminSchema.statics.hashPassword = async function (password: string): Promise<string> {
  const saltRounds = 12; // 🔐 strong but reasonable
  return bcrypt.hash(password, saltRounds);
};

/* ========================= */
/* Indexes                   */
/* ========================= */

AdminSchema.index({ email: 1 });
AdminSchema.index({ isActive: 1 });

/* ========================= */
/* Export model               */
/* ========================= */

const Admin =
  (mongoose.models.Admin as AdminModel) ||
  mongoose.model<AdminDocument, AdminModel>('Admin', AdminSchema);

export default Admin;
