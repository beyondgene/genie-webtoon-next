// app/(admin)/layout.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionLite } from '@/lib/middlewares/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionLite();
  if (!session) redirect('/login?next=/dashboard');
  if (session.role !== 'ADMIN') redirect('/403');

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg hover:bg-gray-100 md:hover:bg-transparent md:px-0"
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      {/* Sidebar (desktop) / Topbar (mobile) */}
      <aside className="hidden md:block border-r">
        <div className="p-4 font-semibold">Admin</div>
        <nav className="flex flex-col gap-1 p-4 text-sm">
          <NavLink href="/dashboard" label="대시보드" />
          <NavLink href="/advertisements" label="광고" />
          <NavLink href="/artists" label="작가" />
          <NavLink href="/webtoons" label="웹툰" />
          <NavLink href="/episodes" label="회차" />
          <NavLink href="/comments" label="댓글" />
          <NavLink href="/members" label="회원" />
        </nav>
      </aside>

      <header className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">Admin</div>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink href="/dashboard" label="대시보드" />
            <NavLink href="/advertisements" label="광고" />
            <NavLink href="/artists" label="작가" />
            <NavLink href="/webtoons" label="웹툰" />
            <NavLink href="/episodes" label="회차" />
            <NavLink href="/comments" label="댓글" />
            <NavLink href="/members" label="회원" />
          </nav>
        </div>
      </header>

      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
