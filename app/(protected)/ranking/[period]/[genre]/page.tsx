// Server Component
import Client from './Client';
// 현재 파일 위치에 맞춰 임포트 경로 유지 (lib로 옮겼다면 '@/lib/ranking' 사용)
import {
  getRanking,
  type Period,
  type GenreSlug,
  type RankingRow,
} from '@/app/api/(protected)/ranking/_lib';

export default async function Page({
  params,
}: {
  params: Promise<{ period: Period; genre: GenreSlug }>;
}) {
  // ✅ Next.js 15: params는 Promise일 수 있음
  const { period, genre } = await params;

  const items: RankingRow[] = await getRanking(period, genre);
  return <Client period={period} genre={genre} items={items} />;
}
