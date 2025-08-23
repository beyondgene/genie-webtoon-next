// app/(member)/my/bookmarks/page.tsx
// 서스펜스/동적 임포트 + (옵션) 가상 스크롤
// app/(member)/my/bookmarks/page.tsx
import { getMySubscriptions } from '@/services/member.service';
import { getWebtoonDetail } from '@/services/webtoon.service';
import BookmarksListClient from './BookmarksListClient';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  return { title: '북마크 | 마이페이지' };
}

export default async function MyBookmarksPage() {
  const subs = await getMySubscriptions();

  // 간단 구현: 상세 N회 호출 (추후 /api/webtoon/bulk로 개선 권장)
  const details = await Promise.all(
    subs.map((s) => getWebtoonDetail(s.webtoonId).catch(() => null))
  );
  const items = details
    .map((w, i) =>
      !w
        ? null
        : {
            idx: w.idx,
            webtoonName: w.webtoonName,
            wbthumbnailUrl: w.wbthumbnailUrl ?? '',
            artistName: w.artist?.artistName,
            views: w.views,
            webtoonId: w.idx,
            alarmOn: subs[i].alarmOn,
          }
    )
    .filter(Boolean) as Array<{
    idx: number;
    webtoonName: string;
    wbthumbnailUrl: string;
    artistName?: string;
    views?: number;
    webtoonId: number;
    alarmOn: boolean;
  }>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-semibold md:text-2xl">북마크</h1>
      <BookmarksListClient items={items} />
    </section>
  );
}

// 분리: 클라이언트 상호작용(알림 토글/해지, 가상 스크롤)
