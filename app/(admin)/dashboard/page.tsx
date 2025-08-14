// app/(admin)/dashboard/page.tsx
import Link from 'next/link';
import { listWebtoons } from '@/services/admin/webtoons.service';
import { listMembers } from '@/services/admin/members.service';
import { listAdvertisements } from '@/services/admin/advertisements.service';
import { listEpisodes } from '@/services/admin/episodes.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [webtoons, members, ads, episodes] = await Promise.all([
    listWebtoons(),
    listMembers(),
    listAdvertisements(),
    listEpisodes(),
  ]);

  const Card = ({ label, value, href }: { label: string; value: number; href: string }) => (
    <Link
      href={href}
      className="rounded-2xl border p-5 hover:shadow md:p-6 transition flex items-center justify-between"
    >
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value.toLocaleString()}</div>
    </Link>
  );

  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card label="웹툰" value={webtoons.length} href="/webtoons" />
        <Card label="회차" value={episodes.length} href="/episodes" />
        <Card label="회원" value={members.length} href="/members" />
        <Card label="광고" value={ads.length} href="/advertisements" />
      </section>

      <section className="rounded-2xl border p-5 md:p-6">
        <div className="text-sm text-gray-600">
          좌측/상단 메뉴에서 각 리소스를 관리하세요. 목록은 모바일에서도 가로 스크롤로 볼 수
          있습니다.
        </div>
      </section>
    </div>
  );
}
