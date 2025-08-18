// shared fetcher
import 'server-only';

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
    thumbnailUrl: w.thumbnailUrl ?? '/placeholder.png',
    views: w[viewKey] ?? w.views ?? 0,
    rank: i + 1,
  }));
}
