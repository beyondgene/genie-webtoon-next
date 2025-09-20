'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Item as RankingItem } from './RankingList';

// 코드 스플리팅: 실제 리스트 UI는 분리
const RankingList = dynamic(() => import('./RankingList'), {
  ssr: false,
  loading: () => <div className="h-40 animate-pulse bg-gray-200 rounded-lg" />,
});

type Props = {
  /** 기본 주간 랭킹. 필요하면 다른 endpoint로 바꿔쓸 수 있음 */
  endpoint?: string;
  /** 미리보기 개수 */
  limit?: number;
};

export default function RankingPreview({ endpoint = '/api/ranking/weekly', limit = 10 }: Props) {
  const [items, setItems] = useState<RankingItem[]>([]);

  useEffect(() => {
    let abort = false;
    (async () => {
      // (protected) 과거 경로도 하위 호환
      const candidates = [endpoint];
      for (const url of candidates) {
        try {
          const res = await fetch(`${url}?limit=${limit}`, { cache: 'no-store' });
          if (!res.ok) continue;
          const raw = await res.json();
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];
          const mapped: RankingItem[] = list.slice(0, limit).map((r: any, i: number) => ({
            idx: r.idx ?? r.webtoonId ?? i + 1,
            webtoonName: r.webtoonName ?? r.title ?? '제목 미상',
            wbthumbnailUrl: r.wbthumbnailUrl ?? '/next.svg',
            rank: r.rank ?? i + 1,
            href: r.href ?? `/webtoon/${r.idx ?? r.webtoonId ?? i + 1}`,
            views:
              typeof r.views === 'number'
                ? r.views
                : typeof r.periodViews === 'number'
                  ? r.periodViews
                  : undefined,
          }));
          if (!abort) setItems(mapped);
          break;
        } catch {
          // 다음 후보 시도
        }
      }
    })();
    return () => {
      abort = true;
    };
  }, [endpoint, limit]);

  return <RankingList items={items} />;
}
