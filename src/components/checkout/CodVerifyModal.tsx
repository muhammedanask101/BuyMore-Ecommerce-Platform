'use client';

import { useState } from 'react';

type Props = {
  phone: string;
  onSuccess: () => void;
  onClose: () => void;
};

export default function CodVerifyModal({ phone, onSuccess, onClose }: Props) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  async function sendOtp() {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/phone/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to send OTP');
      return;
    }

    setOtpSent(true);
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/phone/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Invalid OTP');
      return;
    }

    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 w-full max-w-sm space-y-4 border-4 border-black">
        <h2 className="font-extrabold text-lg">Verify Phone Number</h2>

        <p className="text-sm">
          We will send an OTP to <strong>{phone}</strong>
        </p>

        {!otpSent ? (
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full border-2 border-black py-2 bg-black text-white"
          >
            Send OTP
          </button>
        ) : (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border-2 border-black px-3 py-2"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full border-2 border-black py-2 bg-black text-white"
            >
              Verify & Place Order
            </button>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button onClick={onClose} className="w-full text-sm underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
