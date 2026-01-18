import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import PhoneVerification from '@/models/PhoneVerification';
import { normalizeIndianPhone } from '@/lib/utils/phone';

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(req: Request) {
  await connectDB();
  const { phone, otp } = await req.json();
  const normalizedPhone = normalizeIndianPhone(phone);

  if (!normalizedPhone || !otp) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const record = await PhoneVerification.findOne({ normalizedPhone });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
  }

  if (record.otpHash !== hashOtp(otp)) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  record.verified = true;
  await record.save();

  return NextResponse.json({ success: true });
}
