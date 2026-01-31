import Link from 'next/link';
import { UserCog } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="w-full px-4 md:px-8 py-6 md:py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-wide text-white">Kapithan</p>
            <p className="mt-1 text-sm text-white/70 max-w-md">We sell happiness</p>
          </div>

          <div className="flex gap-6 text-sm font-medium text-white/80">
            <a href="/blog" className="hover:text-white transition">
              About
            </a>
            <a href="/contact" className="hover:text-white transition">
              Contact
            </a>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Kapithan. All rights reserved.</p>
          <div className="flex items-center md:gap-3">
            <Link
              href="/admin"
              aria-label="Admin login"
              className="opacity-60 hover:opacity-100 transition"
            >
              <UserCog className="h-4 w-4" />
            </Link>
            <p className="italic">Built with care • Delivering smiles</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
