'use client';

import useSWR from 'swr';
import dynamic from 'next/dynamic';

// WebtoonCard expects: { webtoon?: { idx, webtoonName, wbthumbnailUrl, artistName?, views?, badge? }, href?, loading?, error?, className? }
const WebtoonCard = dynamic<any>(
  () => import('@/components/cards/WebtoonCard').then((m) => m.default as any),
  {
    ssr: false,
    loading: () => <div className="h-44 w-full animate-pulse rounded-xl bg-zinc-200" />,
  }
);

type ApiSub = {
  webtoonId: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  alarmOn: boolean;
  artistName?: string;
  views?: number;
};

type ApiItem = {
  idx: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  genre?: string | null;
  alarmOn: boolean;
  artistName?: string;
  views?: number;
};

type WebtoonCardData = {
  idx: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  artistName?: string;
  views?: number;
};

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then(async (r) => {
    if (!r.ok) throw new Error('failed');
    return r.json();
  });

export default function BookmarksListClient() {
  const { data, error, isLoading } = useSWR('/api/member/bookmarks', fetcher, {
    revalidateOnFocus: false,
  });

  // 서버가 items 또는 subscriptions 중 어떤 형태로 응답해도 카드용 데이터로 맵핑
  const items: ApiItem[] =
    data?.items ??
    (Array.isArray(data?.subscriptions)
      ? (data.subscriptions as ApiSub[]).map((s) => ({
          idx: s.webtoonId,
          webtoonName: s.webtoonName,
          wbthumbnailUrl: s.wbthumbnailUrl,
          genre: null,
          alarmOn: s.alarmOn,
          artistName: s.artistName,
          views: s.views,
        }))
      : []);

  const cards: WebtoonCardData[] = items.map((w) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    wbthumbnailUrl: w.wbthumbnailUrl,
    artistName: w.artistName,
    views: w.views,
  }));

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        북마크를 불러오지 못했습니다.
      </div>
    );
  }

  // 응답이 왔으면 0건이어도 스켈레톤을 끝내야 함
  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-44 w-full animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="rounded-md border border-zinc-200 p-6 text-sm text-zinc-600">
        아직 구독한 웹툰이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((w) => (
        <WebtoonCard key={w.idx} webtoon={w} href={`/webtoon/${w.idx}`} />
      ))}
    </div>
  );
}
