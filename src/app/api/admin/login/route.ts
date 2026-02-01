import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import LoginAttempt from '@/models/LoginAttempt';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    /* ===========================
       HEADERS (FIXED)
    =========================== */
    const headerStore = await headers();
    const ip =
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerStore.get('x-real-ip') ||
      'unknown';

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    const emailKey = email.toLowerCase();

    /* ===========================
       RATE LIMIT
    =========================== */
    const ipLimit = await checkRateLimit(`ip:${ip}`);
    const emailLimit = await checkRateLimit(`email:${emailKey}`);

    if (ipLimit.blocked || emailLimit.blocked) {
      return NextResponse.json(
        { message: 'Too many login attempts. Try again later.' },
        { status: 429 }
      );
    }

    /* ===========================
       AUTH
    =========================== */
    const admin = await Admin.findOne({
      email: emailKey,
      isActive: true,
    }).select('+passwordHash');

    // timing equalization (prevents email enumeration)
    if (!admin) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const valid = await admin.verifyPassword(password);

    if (!valid) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    /* ===========================
       CLEAR RATE LIMITS ON SUCCESS
    =========================== */
    await LoginAttempt.deleteMany({
      key: { $in: [`ip:${ip}`, `email:${emailKey}`] },
    });

    /* ===========================
       SUCCESS
    =========================== */
    const res = NextResponse.json({
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });

    // 🔐 Secure HTTP-only cookie
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
