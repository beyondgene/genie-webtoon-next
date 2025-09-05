'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/feedback/EmptyState';
import { removeInterest } from '@/services/member.service';

export interface InterestItem {
  artistIdx: number;
  artistName: string;
  interestedAt: string | Date;
  webtoonList?: string | null;
}

function RemoveInterest({ artistId }: { artistId: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
      onClick={() =>
        startTransition(async () => {
          await removeInterest(artistId);
          router.refresh();
        })
      }
      disabled={pending}
    >
      해제
    </button>
  );
}

export default function InterestsClient({ interests }: { interests: InterestItem[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-semibold md:text-2xl">관심 작가</h1>

      {!interests?.length ? (
        <div className="max-w-3xl">
          <EmptyState
            title="관심 작가가 없어요"
            description="작가 페이지에서 관심 등록을 눌러보세요."
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((it) => (
            <li key={it.artistIdx} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-medium">{it.artistName}</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    관심 등록: {new Date(it.interestedAt).toLocaleDateString()}
                  </div>
                  {it.webtoonList ? (
                    <div className="mt-2 text-sm text-zinc-600 line-clamp-2">
                      대표작: {it.webtoonList}
                    </div>
                  ) : null}
                </div>
                <RemoveInterest artistId={it.artistIdx} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
