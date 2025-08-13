// app/(member)/my/bookmarks/BookmarksListClient.tsx
'use client';

import dynamic from 'next/dynamic';
import { useTransition, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/feedback/EmptyState';
import { toggleBookmarkAlarm, unsubscribeBookmark } from '@/services/member.service';

const WebtoonCard = dynamic(() => import('@/components/cards/WebtoonCard').then((m) => m.default), {
  loading: () => <div className="h-44 w-full animate-pulse rounded-xl bg-zinc-200" />,
});

type Item = {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  artistName?: string;
  views?: number;
  webtoonId: number;
  alarmOn: boolean;
};

export default function BookmarksListClient({ items }: { items: Item[] }) {
  const router = useRouter();

  if (items.length === 0) {
    return <EmptyState title="아직 북마크한 작품이 없어요" />;
  }

  // 100개 이상이면 클라이언트에서만 react-virtualized 동적 사용
  if (items.length > 100) {
    return <VirtualizedGrid items={items} onChanged={() => router.refresh()} />;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {items.map((it) => (
        <li key={it.idx} className="flex flex-col gap-2">
          {/* @ts-expect-error: zip 컴포넌트의 느슨한 타입 */}
          <WebtoonCard {...it} />
          <div className="flex gap-2">
            <ToggleAlarm
              webtoonId={it.webtoonId}
              initial={it.alarmOn}
              onDone={() => router.refresh()}
            />
            <UnsubscribeBtn webtoonId={it.webtoonId} onDone={() => router.refresh()} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ToggleAlarm({
  webtoonId,
  initial,
  onDone,
}: {
  webtoonId: number;
  initial: boolean;
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  const [on, setOn] = useState(initial);
  return (
    <button
      className={`flex-1 rounded-xl border px-3 py-2 text-sm ${on ? 'border-indigo-600 text-indigo-600' : 'border-zinc-300 text-zinc-700'}`}
      onClick={() =>
        start(async () => {
          await toggleBookmarkAlarm(webtoonId, !on);
          setOn((v) => !v);
          onDone();
        })
      }
      disabled={pending}
    >
      {on ? '알림 켜짐' : '알림 끔'}
    </button>
  );
}
function UnsubscribeBtn({ webtoonId, onDone }: { webtoonId: number; onDone: () => void }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="flex-1 rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600"
      onClick={() =>
        start(async () => {
          await unsubscribeBookmark(webtoonId);
          onDone();
        })
      }
      disabled={pending}
    >
      구독 해지
    </button>
  );
}

/** (선택) 대용량일 때만 동적 임포트로 가상 스크롤 적용 */
function VirtualizedGrid({ items, onChanged }: { items: Item[]; onChanged: () => void }) {
  const [List, AutoSizer] = useMemo(() => [null, null] as any, []); // 타입 회피
  const [ready, setReady] = useState(false);

  // 런타임에만 로드(없으면 자동 폴백)
  useMemo(() => {
    (async () => {
      try {
        const mod = await import('react-virtualized');
        (VirtualizedGrid as any).List = mod.List;
        (VirtualizedGrid as any).AutoSizer = mod.AutoSizer;
        setReady(true);
      } catch {
        setReady(false);
      }
    })();
  }, []);

  const VList: any = (VirtualizedGrid as any).List;
  const VAutoSizer: any = (VirtualizedGrid as any).AutoSizer;

  if (!ready || !VList || !VAutoSizer) {
    // 폴백: 일반 그리드
    return (
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {items.map((it) => (
          <li key={it.idx} className="flex flex-col gap-2">
            {/* @ts-expect-error */}
            <WebtoonCard {...it} />
            <div className="flex gap-2">
              <ToggleAlarm webtoonId={it.webtoonId} initial={it.alarmOn} onDone={onChanged} />
              <UnsubscribeBtn webtoonId={it.webtoonId} onDone={onChanged} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  // 가상 스크롤 리스트 (카드 높이 고정 가정)
  return (
    <div className="h-[70vh]">
      <VAutoSizer>
        {({ width, height }: any) => (
          <VList
            width={width}
            height={height}
            rowHeight={220}
            rowCount={items.length}
            rowRenderer={({ index, key, style }: any) => {
              const it = items[index];
              return (
                <div key={key} style={style} className="p-2">
                  {/* @ts-expect-error */}
                  <WebtoonCard {...it} />
                  <div className="mt-2 flex gap-2">
                    <ToggleAlarm webtoonId={it.webtoonId} initial={it.alarmOn} onDone={onChanged} />
                    <UnsubscribeBtn webtoonId={it.webtoonId} onDone={onChanged} />
                  </div>
                </div>
              );
            }}
          />
        )}
      </VAutoSizer>
    </div>
  );
}
