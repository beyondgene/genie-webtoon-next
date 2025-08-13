import { api } from '@/lib/fetcher';
import type { RankingResponseDTO, RankingPeriod } from '@/types/dto';

/** 랭킹 조회 (일/주/월/연, 장르 옵션) */
export async function getRanking(period: RankingPeriod, genre?: string) {
  const base = `/api/ranking/${period}`;
  const url = genre ? `${base}/${genre}` : base;
  return api.get<RankingResponseDTO>(url);
}
