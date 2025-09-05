'use client';

import useSWR from 'swr';
import dynamic from 'next/dynamic';
import styled from 'styled-components';

// 웹툰 카드 불러오기
const WebtoonCard = dynamic<any>(
  () => import('@/components/cards/WebtoonCard').then((m) => m.default as any),
  {
    ssr: false,
    loading: () => <div className="h-44 w-full animate-pulse rounded-xl bg-zinc-200" />,
  }
);

// API 응답 가능한 형태들
type ApiSub = {
  webtoonId: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  alarmOn: boolean;
  artistName?: string;
  views?: number;
};

export type ApiItem = {
  idx: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  genre?: string | null;
  alarmOn: boolean;
  artistName?: string;
  views?: number;
  recommend?: number;
};

// 카드 데이터
type WebtoonCardData = {
  idx: number;
  webtoonName: string;
  wbthumbnailUrl: string;
  artistName?: string;
  views?: number;
};

type Props = {
  /** 서버에서 미리 만든 초기 데이터(선택) */
  items?: ApiItem[];
};

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then(async (r) => {
    if (!r.ok) throw new Error('failed');
    return r.json();
  });

export default function BookmarksListClient({ items: initialItems }: Props) {
  const { data, error, isLoading } = useSWR('/api/member/bookmarks', fetcher, {
    revalidateOnFocus: false,
    // 서버에서 내려준 items가 있으면 SWR의 초기값으로 사용
    fallbackData: initialItems ? { items: initialItems } : undefined,
  });

  // 서버/클라이언트 어떤 경로든 items 배열로 수렴
  const items: ApiItem[] =
    data?.items ??
    (Array.isArray(data?.subscriptions)
      ? (data.subscriptions as ApiSub[]).map((s) => ({
          idx: s.webtoonId,
          webtoonName: s.webtoonName,
          wbthumbnailUrl: s.wbthumbnailUrl,
          genre: null,
          alarmOn: s.alarmOn,
          artistName: s.artistName,
          views: s.views,
        }))
      : (initialItems ?? []));

  const cards: WebtoonCardData[] = items.map((w) => ({
    idx: w.idx,
    webtoonName: w.webtoonName,
    wbthumbnailUrl: w.wbthumbnailUrl,
    artistName: w.artistName,
    views: w.views,
  }));

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
        북마크를 불러오지 못했습니다.
      </div>
    );
  }

  if (isLoading && !data && !initialItems) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-44 w-full animate-pulse rounded-xl bg-zinc-200" />
        ))}
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="rounded-md border border-zinc-200 p-6 text-sm text-white">
        아직 구독한 웹툰이 없습니다.
      </div>
    );
  }

  return (
    <StyledGrid className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((w) => (
        <WebtoonCard key={w.idx} webtoon={w} href={`/webtoon/${w.idx}`} />
      ))}
    </StyledGrid>
  );
}

// 이 파일 안에서만 적용되는 스타일 오버라이드
const StyledGrid = styled.div`
  /* 카드 루트가 <a>이고, 그 마지막 자식이 '제목 바'라는 가정(현재 마크업과 일치) */
  & a > *:last-child {
    background: #929292 !important; /* 제목 영역 배경 */
    color: #fff !important; /* 제목 텍스트 */
  }
`;
