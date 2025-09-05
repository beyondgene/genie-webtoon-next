'use client';

import dynamic from 'next/dynamic';

const Podium = dynamic<{ items: ItemForRanking[] }>(() => import('@/components/public/Podium'), {
  ssr: false,
});
const RankingList = dynamic<{ items: ItemForRanking[] }>(
  () => import('@/components/public/RankingList'),
  { ssr: false }
);

export type RankingItem = {
  idx: number;
  webtoonId: number;
  webtoonName: string;
  wbthumbnailUrl?: string; // <- 옵셔널
  genre?: string;
  views?: number;
  recommend?: number;
  alarmOn: boolean;
};

// Podium/RankingList가 기대하는 형태: wbthumbnailUrl을 'string'으로 강제
type ItemForRanking = Omit<RankingItem, 'wbthumbnailUrl'> & { wbthumbnailUrl: string };

export default function FeedRankingClient({ items }: { items: RankingItem[] }) {
  if (!items?.length) return null;

  // 안전 보정: 썸네일이 없으면 placeholder로 채움(경로는 프로젝트에 맞게 교체 가능)
  const safeItems: ItemForRanking[] = items.map((it) => ({
    ...it,
    wbthumbnailUrl: it.wbthumbnailUrl ?? '/images/placeholder.png',
  }));

  return (
    <>
      <Podium items={safeItems.slice(0, 3)} />
      <RankingList items={safeItems} />
    </>
  );
}
