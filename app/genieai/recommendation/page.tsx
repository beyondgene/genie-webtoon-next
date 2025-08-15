// app/genieai/recommendation/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import WebtoonCard, { type WebtoonCardData } from '@/components/cards/WebtoonCard';
import EmptyState from '@/components/feedback/EmptyState';

export const metadata: Metadata = {
  title: '지니 추천 | Genie Webtoon',
  description: 'AI 기반 개인 맞춤 웹툰 추천',
};

// 더 무거운 리스트 표현은 동적 로딩(요구사항 반영)
const Podium = dynamic(() => import('@/components/public/Podium'), { ssr: false });
const RankingList = dynamic(() => import('@/components/public/RankingList'), { ssr: false });

async function getRecommendations(): Promise<WebtoonCardData[]> {
  // 보호 API가 아직 없거나 미구현일 수 있으므로 실패 시 더미 데이터로 대체
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  try {
    const res = await fetch(`${base}/api/genieai/recommendation`, {
      // 개인화 데이터는 항상 최신
      cache: 'no-store',
      headers: {
        cookie: cookies().toString(),
        'x-forwarded-host': (await headers()).get('host') ?? '',
      },
    });
    if (!res.ok) throw new Error('recommendation api unavailable');
    const data = await res.json();
    // 예상 스키마가 달라도 안전하게 매핑
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
    return items.map(
      (w: any, i: number): WebtoonCardData => ({
        idx: Number(w.idx ?? i + 1),
        webtoonName: String(w.webtoonName ?? w.title ?? `추천작 ${i + 1}`),
        thumbnailUrl: w.thumbnailUrl ?? `https://picsum.photos/seed/reco-${i + 1}/400/533`, // 더미 이미지
        artistName: w.artistName ?? w.artist?.artistName,
        views: typeof w.views === 'number' ? w.views : undefined,
      })
    );
  } catch {
    // 더미 12개
    return Array.from({ length: 12 }).map((_, i) => ({
      idx: i + 1,
      webtoonName: `추천작 ${i + 1}`,
      thumbnailUrl: `https://picsum.photos/seed/reco-${i + 1}/400/533`,
      views: 1000 * (12 - i),
    }));
  }
}

export default async function Page() {
  const recos = await getRecommendations();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <section className="mb-8 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">지니 추천</h1>
          <p className="mt-1 text-sm text-zinc-500">
            당신의 취향을 학습해 아직 보지 않았던 웹툰을 추천합니다.
          </p>
        </div>
        <Link
          href="/feed"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          prefetch
        >
          내 피드 보기
        </Link>
      </section>

      {recos.length === 0 ? (
        <EmptyState title="추천 결과가 없어요" description="관심작을 추가하면 더 정확해집니다." />
      ) : (
        <>
          {/* 상단 1~3위 하이라이트: 동적 임포트 + 서스펜스 */}
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />}>
            <Podium
              items={recos.slice(0, 3).map((w) => ({
                idx: w.idx,
                webtoonName: w.webtoonName,
                thumbnailUrl: w.thumbnailUrl,
                views: w.views,
              }))}
            />
          </Suspense>

          {/* 나머지 카드 그리드(반응형) */}
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recos.map((w) => (
              <li key={w.idx}>
                <WebtoonCard webtoon={w} href={`/webtoon/${w.idx}`} />
              </li>
            ))}
          </ul>

          {/* 하단 랭킹 위젯(요구사항의 랭킹 UI 재사용) */}
          <section className="mt-12">
            <h2 className="mb-3 text-lg font-semibold md:text-xl">이번 주 많이 본 웹툰</h2>
            <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />}>
              <RankingList
                items={recos.slice(0, 10).map((w, i) => ({
                  idx: w.idx,
                  webtoonName: w.webtoonName,
                  thumbnailUrl: w.thumbnailUrl,
                  views: w.views,
                  rank: i + 1,
                }))}
              />
            </Suspense>
          </section>
        </>
      )}
    </main>
  );
}
