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
  // 위 div는 왼쪽 nav형태로 뜨는 애들 링크, 아래 div는 메인 관리자 페이지에서 버튼 형식으로 화면에 존재하는 애들 링크
  return (
    <div className="admin-light min-h-dvh bg-white text-gray-900 grid md:grid-cols-[240px_1fr] w-full">
      <aside className="hidden md:block border-r bg-white">
        <div className="p-4">
          <div className="font-semibold mb-3">Admin</div>
          <nav className="space-y-1 text-sm">
            <NavLink href="/dashboard" label="대시보드" />
            <NavLink href="/advertisements" label="광고" />
            <NavLink href="/artists" label="작가" />
            <NavLink href="/webtoons" label="웹툰" />
            <NavLink href="/episodes" label="회차" />
            <NavLink href="/comments" label="댓글" />
            <NavLink href="/members" label="회원" />
            <NavLink href="/subscriptions" label="구독" />
          </nav>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-10 bg-white border-b">
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
            <NavLink href="/subscriptions" label="구독" />
          </nav>
        </div>
      </header>

      <main className="p-4 sm:p-5 md:p-6 bg-white min-h-dvh overflow-x-auto">{children}</main>
    </div>
  );
}
