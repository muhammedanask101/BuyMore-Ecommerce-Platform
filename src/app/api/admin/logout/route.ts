import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.redirect(new URL('/admin-login', process.env.NEXT_PUBLIC_BASE_URL!));

  res.cookies.set({
    name: 'admin_session',
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return res;
}
