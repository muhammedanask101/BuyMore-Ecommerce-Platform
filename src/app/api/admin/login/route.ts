import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).select('+passwordHash');

    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await admin.verifyPassword(password);

    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });

    // 🔐 Set secure HTTP-only cookie
    res.cookies.set({
      name: 'admin_session',
      value: admin._id.toString(),
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err) {
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
