// app/(admin)/dashboard/page.tsx
import Link from 'next/link';
import { listWebtoons } from '@/services/admin/webtoons.service';
import { listMembers } from '@/services/admin/members.service';
import { listAdvertisements } from '@/services/admin/advertisements.service';
import { listEpisodes } from '@/services/admin/episodes.service';
import { listArtists } from '@/services/admin/artists.service';
import { listSubscriptions } from '@/services/admin/subscriptions.service';

// 짧은 ISR + 리전 고정으로 TTFB 절감
export const revalidate = 60; // 1분 캐시
export const runtime = 'nodejs';
export const preferredRegion = ['icn1', 'hnd1']; // Vercel 한국/일본

// 관리자 페이지 접속시 맨처음 나오는 홈화면
export default async function Page() {
  const [webtoons, members, ads, episodes, artists, subs] = await Promise.all([
    listWebtoons(),
    listMembers(),
    listAdvertisements(),
    listEpisodes(),
    listArtists(),
    listSubscriptions(),
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
  // 카드 형식으로 해당 기능을 누르면 해당 영역의 관리자 대쉬보드 페이지가 나옴
  return (
    <div className="max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card label="웹툰" value={webtoons.length} href="/webtoons" />
        <Card label="회차" value={episodes.length} href="/episodes" />
        <Card label="회원" value={members.length} href="/members" />
        <Card label="광고" value={ads.length} href="/advertisements" />
        <Card label="작가" value={artists.length} href="/artists" />
        <Card label="구독" value={subs.length} href="/subscriptions" />
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
