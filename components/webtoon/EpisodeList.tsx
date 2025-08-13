// 반응형 그리드 강화
// 옵션 가상 스크롤 지원(요구사항의 react-virtualized 최적화 반영, 필요 시만 로드)
// 스켈레톤/빈/에러 유지
'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

export type EpisodeItem = {
  idx: number;
  title: string;
  thumbnailUrl: string;
  uploadDate: string | Date;
};

type Props = {
  webtoonId: number | string;
  episodes?: EpisodeItem[];
  loading?: boolean;
  error?: string | Error;
  emptyText?: string;
  /** 긴 리스트면 true 권장: react-virtualized 동적 로드 */
  virtualized?: boolean;
  /** virtualized일 때 높이 */
  height?: number | string;
  /** virtualized일 때 각 아이템 높이(px) */
  itemHeight?: number;
  className?: string;
};

const formatDate = (d: string | Date) => {
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(dt);
  } catch {
    return '';
  }
};

export default function EpisodeList({
  webtoonId,
  episodes,
  loading,
  error,
  emptyText = '등록된 회차가 없습니다.',
  virtualized,
  height = '70vh',
  itemHeight = 160,
  className = '',
}: Props) {
  // 1) 로딩/에러/빈 상태
  if (loading || !episodes) {
    return (
      <ul
        className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i} className="animate-pulse overflow-hidden rounded-2xl border">
            <div className="relative aspect-[3/2] w-full bg-zinc-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-2/3 rounded bg-zinc-200" />
              <div className="h-3 w-1/3 rounded bg-zinc-200" />
            </div>
          </li>
        ))}
      </ul>
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
  if (episodes.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500 ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  // 2) 긴 리스트 최적화(선택)
  const shouldVirt = virtualized ?? episodes.length > 60;
  const [RV, setRV] = React.useState<any>(null);

  React.useEffect(() => {
    if (shouldVirt) {
      // 클라이언트에서만 로드
      import('react-virtualized').then((m) => setRV(m)).catch(() => setRV(null));
    }
  }, [shouldVirt]);

  if (shouldVirt && RV?.AutoSizer && RV?.List) {
    const { AutoSizer, List } = RV;
    return (
      <div className={`overflow-hidden rounded-2xl border ${className}`} style={{ height }}>
        <AutoSizer>
          {({ width, height: h }: any) => (
            <List
              width={width}
              height={h}
              rowCount={episodes.length}
              rowHeight={itemHeight}
              overscanRowCount={8}
              rowRenderer={({ index, key, style }: any) => {
                const ep = episodes[index];
                return (
                  <div key={key} style={style} className="border-b last:border-none">
                    <Link
                      href={`/webtoon/${webtoonId}/episodes/${ep.idx}`}
                      className="flex gap-3 p-3 hover:bg-zinc-50"
                      aria-label={`${ep.title} 보기`}
                    >
                      <div className="relative h-24 w-40 shrink-0 sm:h-28 sm:w-48 md:h-32 md:w-56">
                        <Image
                          src={ep.thumbnailUrl}
                          alt={ep.title}
                          fill
                          sizes="(max-width:640px) 40vw, (max-width:768px) 33vw, 25vw"
                          className="object-cover rounded-xl"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm sm:text-base font-medium">{ep.title}</div>
                        <div className="mt-1 text-xs sm:text-sm text-zinc-500">
                          {formatDate(ep.uploadDate)}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              }}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  // 3) 일반 그리드(반응형)
  return (
    <ul
      className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${className}`}
    >
      {episodes.map((ep) => (
        <li key={ep.idx} className="overflow-hidden rounded-2xl border hover:shadow">
          <Link
            href={`/webtoon/${webtoonId}/episodes/${ep.idx}`}
            className="block"
            aria-label={`${ep.title} 보기`}
          >
            <div className="relative aspect-[3/2] w-full">
              <Image
                src={ep.thumbnailUrl}
                alt={ep.title}
                fill
                sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1024px) 25vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <div className="truncate text-sm sm:text-base font-medium">{ep.title}</div>
              <div className="mt-1 text-xs sm:text-sm text-zinc-500">
                {formatDate(ep.uploadDate)}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
