// Server Component
import Client from './Client';
// 각 랭킹 폴더에 있는 라우터 호출
import {
  getRanking,
  type Period,
  type GenreSlug,
  type RankingRow,
  getRankingCached,
} from '@/app/api/(protected)/ranking/_lib';

export const revalidate = 30; // 10분
export const preferredRegion = ['icn1', 'hnd1'];

export default async function Page({
  params,
}: {
  params: Promise<{ period: Period; genre: GenreSlug }>;
}) {
  // Next.js 15: params는 Promise일 수 있음
  const { period, genre } = await params;

  const items: RankingRow[] = await getRankingCached(period, genre);
  return <Client period={period} genre={genre} items={items} />;
}
