//개인화 피드, 여러 API 조합(북마크, 관심작, 최근본 등)으로 클라이언트 합성 가능
// app/feed/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import WebtoonCard from '@/components/cards/WebtoonCard';
import EmptyState from '@/components/feedback/EmptyState';

// 랭킹 UI는 동적 임포트 (번들 경량화)
const Podium = dynamic(() => import('@/components/public/Podium'), { ssr: false });
const RankingList = dynamic(() => import('@/components/public/RankingList'), { ssr: false });

type RankingItem = {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  views?: number;
  rank?: number;
};

async function safeJson(url: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}${url}`, {
    cache: 'no-store',
    headers: {
      cookie: cookies().toString(),
      'x-forwarded-host': (await headers()).get('host') ?? '',
    },
  }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json().catch(() => null);
}

async function getWeeklyRanking(): Promise<RankingItem[]> {
  // 컨트롤러가 thumbnailUrl을 안 줄 수도 있어 안전 매핑 + 더미 이미지
  const data =
    (await safeJson('/api/(protected)/ranking/weekly/ALL')) ||
    (await safeJson('/api/(protected)/ranking/weekly')) ||
    null;

  const items: any[] = Array.isArray(data?.data) ? data!.data : Array.isArray(data) ? data : [];

  if (!items.length) {
    // 더미 10개
    return Array.from({ length: 10 }).map((_, i) => ({
      idx: i + 1,
      webtoonName: `인기작 ${i + 1}`,
      thumbnailUrl: `https://picsum.photos/seed/weekly-${i + 1}/400/533`,
      views: 5000 - i * 137,
      rank: i + 1,
    }));
  }

  return items.map((w, i) => ({
    idx: Number(w.idx ?? i + 1),
    webtoonName: String(w.webtoonName ?? w.title ?? `웹툰 ${i + 1}`),
    thumbnailUrl: w.thumbnailUrl ?? `https://picsum.photos/seed/weekly-${i + 1}/400/533`,
    views: typeof w.weeklyViews === 'number' ? w.weeklyViews : w.views,
    rank: i + 1,
  }));
}

async function getProfile(): Promise<{ nickname?: string } | null> {
  const data = await safeJson('/api/(protected)/member/profile');
  return (data && (data.data ?? data)) || null;
}

export default async function FeedPage() {
  const [profile, weekly] = await Promise.all([getProfile(), getWeeklyRanking()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <header className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {profile?.nickname ? `${profile.nickname}님의 피드` : '내 피드'}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            북마크/관심작/최근 본 작품을 중심으로 개인화 콘텐츠를 보여줍니다. (API 미구현 구간은
            더미로 구성)
          </p>
        </div>
        <Link
          href="/genieai/recommendation"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          prefetch
        >
          AI 추천 보기
        </Link>
      </header>

      {/* 1) 이번 주 많이 본 웹툰 */}
      <section className="rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold md:text-xl">이번 주 인기</h2>
          <Link href="/ranking/weekly/ALL" className="text-sm text-zinc-500 underline" prefetch>
            전체 랭킹
          </Link>
        </div>

        <div className="mt-4">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-zinc-200" />}>
            <Podium
              items={weekly.slice(0, 3).map((w) => ({
                idx: w.idx,
                webtoonName: w.webtoonName,
                thumbnailUrl: w.thumbnailUrl!,
                views: w.views,
              }))}
            />
          </Suspense>
          <Suspense fallback={<div className="mt-6 h-40 animate-pulse rounded-2xl bg-zinc-200" />}>
            <RankingList items={weekly} />
          </Suspense>
        </div>
      </section>

      {/* 2) 북마크 섹션 (더미) */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold md:text-xl">내 북마크</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <WebtoonCard
                webtoon={{
                  idx: 900 + i,
                  webtoonName: `북마크 ${i + 1}`,
                  thumbnailUrl: `https://picsum.photos/seed/bm-${i + 1}/400/533`,
                }}
                href={`/webtoon/${900 + i}`}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* 3) 관심 작가 업데이트 (더미) */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold md:text-xl">관심 작가 최신</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <article
              key={i}
              className="rounded-2xl border p-4 hover:bg-zinc-50 md:flex md:items-center md:justify-between"
            >
              <div>
                <div className="font-medium">작가 {i + 1}</div>
                <div className="text-sm text-zinc-500">신규 연재 소식이 있어요</div>
              </div>
              <Link
                href={`/artist/${i + 1}`}
                className="mt-3 inline-block rounded-xl bg-black px-3 py-2 text-sm text-white hover:opacity-90 md:mt-0"
                prefetch
              >
                보러가기
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
