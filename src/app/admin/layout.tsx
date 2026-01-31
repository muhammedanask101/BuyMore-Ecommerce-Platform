export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

/* ============================
   SERVER AUTH (SECURE)
============================ */

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('admin_session')?.value;

  if (!sessionId) {
    redirect('/admin-login');
  }

  await connectDB();

  const admin = await Admin.findById(sessionId).select('_id role isActive').lean();

  if (!admin || !admin.isActive || admin.role !== 'admin') {
    redirect('/admin-login');
  }
}

/* ============================
   LAYOUT
============================ */

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 🔐 AUTH CHECK – RUNS ON EVERY REQUEST
  await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-100 overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* SIDEBAR (DESKTOP) */}
        <aside className="hidden lg:flex w-64 flex-col border-r-4 border-black bg-white">
          <div className="p-6 border-b-4 border-black">
            <h1 className="text-2xl font-extrabold">Kapithan</h1>
            <p className="text-xs opacity-70">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Nav href="/admin">Dashboard</Nav>
            <Nav href="/admin/products">Products</Nav>
            <Nav href="/admin/media">Media</Nav>
          </nav>

          <form action="/api/admin/logout" method="POST" className="p-4 border-t-4 border-black">
            <button
              type="submit"
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
          </form>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {/* MOBILE HEADER */}
            <div
              className="lg:hidden mb-6 border-4 border-black bg-white p-4 flex justify-between items-center max-w-full"
              style={{ boxSizing: 'border-box' }}
            >
              <span className="font-extrabold">Admin</span>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================
   NAV ITEM
============================ */

function Nav({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        block
        border-2 border-black
        px-4 py-2
        font-medium
        bg-white
        hover:bg-black
        hover:text-white
        transition
      "
    >
      {children}
    </Link>
  );
}
