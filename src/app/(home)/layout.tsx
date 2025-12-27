import { Navbar } from '@/components/custom/Navbar';
import { Footer } from '@/components/custom/Footer';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
