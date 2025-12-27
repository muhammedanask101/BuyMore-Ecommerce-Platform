'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data: { message?: string } = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      router.replace('/admin');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      {/* OUTER FRAME */}
      <div className="w-full max-w-sm border-4 border-black bg-white">
        {/* HEADER */}
        <div className="border-b-4 border-black px-6 py-5">
          <h1 className="text-2xl font-extrabold tracking-tight">ADMIN ACCESS</h1>
          <p className="text-xs mt-1 opacity-70 uppercase tracking-wide">Restricted Area</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full
                border-2 border-black
                px-3 py-2
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full
                border-2 border-black
                px-3 py-2
                text-sm
                focus:outline-none
                focus:ring-2
                focus:ring-black
              "
            />
          </div>

          {error && (
            <div className="border-2 border-black bg-red-200 px-3 py-2 text-xs font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              border-2 border-black
              bg-black
              text-white
              py-2
              text-sm
              font-extrabold
              uppercase
              tracking-wide
              hover:bg-white
              hover:text-black
              transition
              disabled:opacity-50
            "
          >
            {loading ? 'Authorizing…' : 'Enter'}
          </button>
        </form>

        {/* FOOTER */}
        <div className="border-t-4 border-black px-6 py-3 text-[10px] text-center uppercase tracking-wide opacity-60">
          Unauthorized access prohibited
        </div>
      </div>
    </div>
  );
}
