'use client';

import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { usePathname } from 'next/navigation';
import { NavbarSidebar } from './Navbar-Sidebar';
import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { CartIcon } from '@/components/custom/CartIcon';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
});

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        'bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg',
        isActive && 'bg-black text-white hover:bg-black hover:text-white'
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const navbarItems = [
  { href: '/', children: 'Home' },
  { href: '/about', children: 'About' },
  { href: '/contact', children: 'Contact' },
];

export const Navbar = () => {
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/" className="pl-6 flex items-center">
        <span className={cn('text-5xl font-semibold', poppins.className)}>Kapithan</span>
      </Link>

      <NavbarSidebar items={navbarItems} open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

      <div className="items-center gap-4 hidden pr-3 lg:flex">
        {navbarItems.map((item) => (
          <NavbarItem key={item.href} href={item.href} isActive={pathname == item.href}>
            {item.children}
          </NavbarItem>
        ))}
        <CartIcon />
      </div>

      <div className="flex lg:hidden items-center gap-2 pr-2">
        <CartIcon />

        <Button
          variant="ghost"
          className="size-12 border-transparent bg-white"
          onClick={() => {
            setIsSidebarOpen(true);
          }}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};
