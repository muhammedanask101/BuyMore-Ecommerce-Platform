import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import PhoneVerification from '@/models/PhoneVerification';
import { sendSms } from '@/lib/sms/sendSms';
import { normalizeIndianPhone } from '@/lib/utils/phone';

function hashOtp(otp: string) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function POST(req: Request) {
  await connectDB();

  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await PhoneVerification.findOneAndUpdate(
    { phone },
    {
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
    },
    { upsert: true }
  );

  const normalizedPhone = normalizeIndianPhone(phone);
  await sendSms(normalizedPhone, `Your Kapithan OTP is ${otp}`);

  return NextResponse.json({ success: true });
}
