'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin-login');
  }

  return (
    <button
      onClick={logout}
      className="
        w-full
        border-2 border-black
        px-4 py-2
        font-medium
        bg-white
        hover:bg-black
        hover:text-white
        transition
      "
    >
      Logout
    </button>
  );
}
