// shared fetcher
import 'server-only';
// 랭킹 페이지에서 fetchApi 설정 파일
export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export async function fetchRanking(period: RankingPeriod, genre: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/ranking/${period}/${encodeURIComponent(genre)}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const payload = await res.json();
  const arr = Array.isArray(payload) ? payload : payload.data;
  const viewKey =
    period === 'daily'
      ? 'dailyViews'
      : period === 'weekly'
        ? 'weeklyViews'
        : period === 'monthly'
          ? 'monthlyViews'
          : 'yearlyViews';
  return (arr ?? []).map((w: any, i: number) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    wbthumbnailUrl: w.wbthumbnailUrl ?? '/placeholder.png',
    views: w[viewKey] ?? w.views ?? 0,
    rank: i + 1,
  }));
}
