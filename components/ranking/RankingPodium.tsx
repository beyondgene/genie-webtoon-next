// public/Podium을 감싸 스켈레톤/빈/에러 상태를 제공(요구사항 체크 포인트)
// 반응형 여백·타이포 보강
'use client';

import * as React from 'react';
import Podium from '@/components/public/Podium';

type Item = { idx: number; webtoonName: string; wbthumbnailUrl: string; views?: number };

type Props = {
  items?: Item[];
  loading?: boolean;
  error?: string | Error;
  emptyText?: string;
  className?: string;
};
// 랭킹에서 사용되는 단상 컴포넌트
export default function RankingPodium({
  items,
  loading,
  error,
  emptyText = '랭킹 데이터가 없습니다.',
  className = '',
}: Props) {
  if (loading || !items) {
    return (
      <div className={`grid grid-cols-3 gap-3 sm:gap-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-3 sm:p-4">
            <div className="aspect-square w-full animate-pulse rounded-xl bg-zinc-200" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    );
  }
  // 에러 발생 또는 랭킹에 사용될 작품이 없을때 에러 처리
  if (error) {
    return (
      <div
        className={`rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${className}`}
      >
        {typeof error === 'string' ? error : error.message}
      </div>
    );
  }

  if (items.length < 1) {
    return (
      <div
        className={`rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500 ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  return <Podium items={items} />;
}
