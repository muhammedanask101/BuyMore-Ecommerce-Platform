import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

export type AdminSession = {
  _id: string;
  email: string;
  role: 'admin' | 'editor';
};

export async function requireAdmin(): Promise<AdminSession | null> {
  try {
    // ✅ FIX: await cookies()
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('admin_session')?.value;

    if (!sessionId) {
      return null;
    }

    await connectDB();

    const admin = await Admin.findById(sessionId).select('_id email role isActive').lean();

    if (!admin || !admin.isActive) {
      return null;
    }

    return {
      _id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };
  } catch {
    // 🔐 Fail closed
    return null;
  }
}
