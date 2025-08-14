'use client';

import Link from 'next/link';
import { use } from 'react';
import { getEpisodeNavigation } from '@/services/episode.service';
import { ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/outline'; // (C)

interface Props {
  webtoonId: number | string;
  episodeId: number | string;
  dataPromise?: ReturnType<typeof getEpisodeNavigation>;
}

export default function EpisodeNavigator({ webtoonId, episodeId, dataPromise }: Props) {
  const data = dataPromise ? use(dataPromise) : undefined;
  const state = data ?? { prev: null, next: null, totalCount: 0 };

  return (
    <nav
      className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      aria-label="에피소드 내비게이션"
    >
      <div className="text-sm text-neutral-500">총 {state.totalCount?.toLocaleString()}화</div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
        <Link
          href={state.prev ? `/webtoon/${webtoonId}/${state.prev.idx}` : '#'}
          className={`rounded-xl border px-4 py-2 text-center text-sm sm:text-base ${state.prev ? 'hover:bg-neutral-50' : 'pointer-events-none opacity-40'}`}
          aria-disabled={!state.prev}
        >
          <ChevronLeftIcon className="mr-1 inline h-4 w-4" aria-hidden="true" />
          {state.prev ? state.prev.title : '이전화 없음'}
        </Link>
        <Link
          href={`/webtoon/${webtoonId}`}
          className="rounded-xl border px-4 py-2 text-center text-sm sm:text-base hover:bg-neutral-50"
        >
          <ListBulletIcon className="mr-1 inline h-4 w-4" aria-hidden="true" />
          목록
        </Link>
        <Link
          href={state.next ? `/webtoon/${webtoonId}/${state.next.idx}` : '#'}
          className={`rounded-xl border px-4 py-2 text-center text-sm sm:text-base ${state.next ? 'hover:bg-neutral-50' : 'pointer-events-none opacity-40'}`}
          aria-disabled={!state.next}
        >
          {state.next ? state.next.title : '다음화 없음'}
          <ChevronRightIcon className="ml-1 inline h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
