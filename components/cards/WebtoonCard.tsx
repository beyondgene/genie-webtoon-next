// 반응형 이미지 sizes 최적화, ARIA 라벨 보강
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatK } from '@/lib/format';
import * as React from 'react';

export type WebtoonCardData = {
  idx: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  artistName?: string;
  views?: number;
  badge?: React.ReactNode;
};

type Props = {
  webtoon?: WebtoonCardData;
  href?: string;
  loading?: boolean;
  error?: string | Error;
  className?: string;
};

export default function WebtoonCard({ webtoon, href, loading, error, className = '' }: Props) {
  if (loading || !webtoon) {
    return (
      <div className={`animate-pulse overflow-hidden rounded-2xl shadow ${className}`}>
        <div className="aspect-[3/4] w-full bg-zinc-200" />
        <div className="space-y-2 p-3">
          <div className="h-4 w-2/3 rounded bg-zinc-200" />
          <div className="h-3 w-1/3 rounded bg-zinc-200" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div
        className={`rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${className}`}
      >
        {typeof error === 'string' ? error : error.message}
      </div>
    );
  }

  const to = href ?? `/webtoon/${webtoon.idx}`;

  return (
    <Link
      href={to}
      className={`group overflow-hidden rounded-2xl shadow transition hover:-translate-y-0.5 ${className}`}
      aria-label={`${webtoon.webtoonName} 상세보기`}
    >
      <div className="relative aspect-[3/4] w-full">
        <Image
          src={webtoon.wbthumbnailUrl}
          alt={webtoon.webtoonName}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
          className="object-cover transition group-hover:scale-105"
          priority={false}
        />
        {webtoon.badge && (
          <div className="absolute left-2 top-2 z-10 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
            {webtoon.badge}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="truncate font-medium">{webtoon.webtoonName}</div>
        <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
          <span className="truncate">{webtoon.artistName ?? ''}</span>
          {typeof webtoon.views === 'number' && <span>{formatK(webtoon.views)} views</span>}
        </div>
      </div>
    </Link>
  );
}
