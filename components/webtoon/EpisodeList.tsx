'use client';

import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

// 프런트에서 에피소드를 객체로서 확장시키는 타입
export type EpisodeItem = {
  idx: number;
  title: string;
  epthumbnailUrl: string;
  uploadDate: string | Date;
};

// 에피소드 추가 속성타입 정의
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

// 한국기준 시간 형태 정의
const formatDate = (d: string | Date) => {
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(dt);
  } catch {
    return '';
  }
};

// react-virtualized 타입 추론용
type RVModule = typeof import('react-virtualized');
type RowRendererParams = {
  index: number;
  key: string;
  style: React.CSSProperties;
};

// 에피소드 리스트
export default function EpisodeList(props: Props) {
  const {
    webtoonId,
    episodes,
    loading,
    error,
    emptyText = '등록된 회차가 없습니다.',
    virtualized,
    height: containerHeight = '70vh',
    itemHeight = 160,
    className = '',
  } = props;

  // ✅ Hook은 항상 최상단에서 호출
  const shouldVirt = Boolean(virtualized ?? (episodes?.length ?? 0) > 60);
  const [RV, setRV] = React.useState<RVModule | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (shouldVirt) {
      import('react-virtualized')
        .then((m) => {
          if (mounted) setRV(m);
        })
        .catch(() => {
          if (mounted) setRV(null);
        });
    } else {
      setRV(null);
    }
    return () => {
      mounted = false;
    };
  }, [shouldVirt]);

  // ⬇️ 여기부터 조건부 렌더링 (Hook 호출 이후로 배치)

  // 1) 로딩/프리뷰 스켈레톤
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

  // 2) 에러 표시
  if (error) {
    return (
      <div
        className={`rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${className}`}
      >
        {typeof error === 'string' ? error : error.message}
      </div>
    );
  }

  // 3) 빈 상태
  if (episodes.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-dashed p-8 text-center text-sm text-zinc-500 ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  // 4) 긴 리스트 최적화 (react-virtualized)
  if (shouldVirt && RV?.AutoSizer && RV?.List) {
    const { AutoSizer, List } = RV;
    return (
      <div
        className={`overflow-hidden rounded-2xl border ${className}`}
        style={{ height: containerHeight }}
      >
        <AutoSizer>
          {({ width, height }: { width: number; height: number }) => (
            <List
              width={width}
              height={height}
              rowCount={episodes.length}
              rowHeight={itemHeight}
              overscanRowCount={8}
              rowRenderer={({ index, key, style }: RowRendererParams) => {
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
                          src={ep.epthumbnailUrl}
                          alt={ep.title}
                          fill
                          sizes="(max-width:640px) 40vw, (max-width:768px) 33vw, 25vw"
                          className="rounded-xl object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium sm:text-base">{ep.title}</div>
                        <div className="mt-1 text-xs text-zinc-500 sm:text-sm">
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

  // 5) 일반 그리드(반응형)
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
                src={ep.epthumbnailUrl}
                alt={ep.title}
                fill
                sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, (max-width:1024px) 25vw, 20vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-medium sm:text-base">{ep.title}</div>
              <div className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {formatDate(ep.uploadDate)}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
