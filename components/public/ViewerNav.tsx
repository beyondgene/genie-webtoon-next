'use client';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function ReaderControls({
  webtoonId,
  prevEpId,
  nextEpId,
}: {
  webtoonId: string | number;
  prevEpId?: string | number | null;
  nextEpId?: string | number | null;
}) {
  const Btn = (props: any) => (
    <button
      {...props}
      className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm
      ${props.disabled ? 'bg-zinc-100/50 text-zinc-400' : 'bg-zinc-100 hover:bg-zinc-200'}`}
    />
  );
  return (
    <nav
      aria-label="에피소드 내비게이션"
      className="fixed inset-x-2 bottom-4 z-10 mx-auto flex max-w-3xl justify-between rounded-full bg-white/90 p-2 shadow-lg backdrop-blur
                 sm:inset-x-4 sm:p-3"
    >
      <Link
        href={`/webtoon/${webtoonId}`}
        className="rounded-full bg-zinc-100 px-4 py-2 text-sm hover:bg-zinc-200"
      >
        <span className="sr-only">목록</span>
        <ListBulletIcon className="h-5 w-5" />
      </Link>
      <div className="flex gap-2">
        <Link
          aria-disabled={!prevEpId}
          href={prevEpId ? `/webtoon/${webtoonId}/episodes/${prevEpId}` : '#'}
          prefetch
        >
          <Btn disabled={!prevEpId}>
            <ChevronLeftIcon className="h-5 w-5" /> 이전화
          </Btn>
        </Link>
        <Link
          aria-disabled={!nextEpId}
          href={nextEpId ? `/webtoon/${webtoonId}/episodes/${nextEpId}` : '#'}
          prefetch
        >
          <Btn disabled={!nextEpId}>
            다음화 <ChevronRightIcon className="h-5 w-5" />
          </Btn>
        </Link>
      </div>
    </nav>
  );
}
