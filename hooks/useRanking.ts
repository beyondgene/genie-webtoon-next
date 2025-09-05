'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RankingItemDTO, RankingPeriod, RankingResponseDTO } from '@/types/dto';
import { getRanking } from '@/services/ranking.service';

// 프런트에서 랭킹 결과를 표현하기 위한 데이터 타입 인터페이스 정의
export interface UseRankingResult {
  data?: RankingResponseDTO;
  podium: RankingItemDTO[]; // 상단 1~3위
  list: RankingItemDTO[]; // 그 외
  loading: boolean;
  error?: Error;
  refresh: () => Promise<void>;
}
// 캐시 정의
const cache = new Map<string, RankingResponseDTO>();
// 랭킹 결과 로직 함수
export function useRanking(period: RankingPeriod, genre?: string): UseRankingResult {
  const key = genre ? `${period}:${genre}` : period;
  const [data, setData] = useState<RankingResponseDTO | undefined>(() => cache.get(key));
  const [loading, setLoading] = useState(!cache.has(key));
  const [error, setError] = useState<Error | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  // try-catch를 통한 장르,시점 중 하나라도 불러오지 못하면 에러 문구 사용
  const fetchData = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(undefined);
    try {
      const res = await getRanking(period, genre);
      cache.set(key, res);
      setData(res);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error('랭킹을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, [genre, key, period]);
  // 케시가 없을면 useEffect를 통해 초기화 명령어
  useEffect(() => {
    if (!cache.has(key)) void fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData, key]);

  const podium = useMemo(() => (data?.items ?? []).slice(0, 3), [data]);
  const list = useMemo(() => (data?.items ?? []).slice(3), [data]);

  return { data, podium, list, loading, error, refresh: fetchData };
}

// 리스트/단상 분리 OK + 캐시 워밍(권장)
export async function prewarmRanking(period: RankingPeriod, genres: string[]) {
  for (const g of genres) {
    try {
      cache.set(`${period}:${g}`, await getRanking(period, g));
    } catch {}
  }
}
