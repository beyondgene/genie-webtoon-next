import { Suspense } from 'react';
import dynamic from 'next/dynamic';

type Item = {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  views?: number;
  rank?: number;
};
type PodiumProps = { items: Item[] };
type ListProps = { items: Item[] };

const Podium = dynamic<PodiumProps>(
  () => import('@/components/ranking/RankingPodium').then((m) => m.default),
  {
    ssr: true,
    loading: () => <div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />,
  }
);
const RankingList = dynamic<ListProps>(
  () => import('@/components/public/RankingList').then((m) => m.default),
  {
    ssr: true,
    loading: () => <div className="h-48 animate-pulse rounded-2xl bg-zinc-100" />,
  }
);

async function fetchRanking(genre: string): Promise<Item[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/ranking/monthly/${encodeURIComponent(genre)}`, {
    next: { revalidate: 300, tags: [`ranking:monthly:${genre}`] },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const r = await fetch(`${base}/api/genre/list`, { next: { revalidate: 3600 } });
  const genres: { slug: string }[] = r.ok ? await r.json() : [];
  return genres.slice(0, 20).map((g) => ({ genre: g.slug }));
}

export async function generateMetadata({ params }: { params: { genre: string } }) {
  const title = `월간 랭킹 — ${decodeURIComponent(params.genre)} | Genie Webtoon`;
  const description = `월간 ${decodeURIComponent(params.genre)} 장르 인기 웹툰 순위`;
  return { title, description, openGraph: { title, description } };
}

export default async function MonthlyRankingPage({ params }: { params: { genre: string } }) {
  const items = await fetchRanking(params.genre);
  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold">
        월간 랭킹 — {decodeURIComponent(params.genre)}
      </h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-zinc-100" />}>
        <Podium items={items} />
      </Suspense>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-zinc-100" />}>
        <RankingList items={items} />
      </Suspense>
    </main>
  );
}
