// 상세 + 목차
import Image from 'next/image';
import Link from 'next/link';

type EpisodeLite = { idx: number; title: string; uploadDate: string };

async function getWebtoonDetail(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/(protected)/webtoon/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;

  const raw = await res.json();
  // 일부 백엔드는 { data } 혹은 { webtoon }로 감싸 내려올 수 있어 언랩 처리
  const w = raw?.data ?? raw?.webtoon ?? raw;

  return {
    idx: w.idx ?? w.id,
    webtoonName: w.webtoonName ?? w.name ?? w.title ?? '제목 미정',
    thumbnailUrl: w.thumbnailUrl ?? w.thumbnail ?? '/placeholder.png',
    artistName: w.artistName ?? w.authorName ?? w.Artist?.artistName ?? '-',
    description: w.description ?? w.synopsis ?? '',
  };
}

async function getEpisodeList(id: string): Promise<EpisodeLite[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  // 실제 운영 경로에 맞춰 (protected)로 호출
  const res = await fetch(`${base}/api/(protected)/webtoon/${id}/episodes`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];

  const raw = await res.json();
  const arr = Array.isArray(raw) ? raw : (raw?.data ?? raw?.episodes ?? []);
  return arr.map((e: any) => ({
    idx: e.idx ?? e.id,
    title: e.title ?? e.name ?? `Episode ${e.idx ?? e.id}`,
    uploadDate: e.uploadDate ?? e.createdAt ?? new Date().toISOString(),
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/(protected)/webtoon/${params.id}`, {
    next: { revalidate: 300 },
  });
  const raw = res.ok ? await res.json() : null;
  const w = raw?.data ?? raw?.webtoon ?? raw;
  const title = w?.name ?? w?.webtoonName ?? '웹툰 상세';
  const desc = w?.description ?? '지니 웹툰 상세 페이지';
  const image = w?.thumbnailUrl ?? w?.thumbnail ?? '/opengraph-image.jpg';
  return { title, description: desc, openGraph: { title, description: desc, images: [image] } };
}

export default async function WebtoonDetailPage({ params }: { params: { id: string } }) {
  const [detail, episodes] = await Promise.all([
    getWebtoonDetail(params.id),
    getEpisodeList(params.id),
  ]);
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="grid gap-6 md:grid-cols-[200px,1fr]">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow">
          <Image
            src={detail?.thumbnailUrl ?? '/placeholder.png'}
            alt={detail?.webtoonName ?? 'thumbnail'}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{detail?.webtoonName ?? '제목 미정'}</h1>
          <div className="text-sm text-zinc-600">작가: {detail?.artistName ?? '-'}</div>
          <p className="text-sm leading-relaxed text-zinc-700">
            {detail?.description ?? '소개가 없습니다.'}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">목차</h2>
        <ul className="divide-y rounded-2xl border bg-white">
          {episodes.map((ep: EpisodeLite) => (
            <li key={ep.idx} className="flex items-center justify-between p-3 hover:bg-zinc-50">
              <div className="truncate pr-3">{ep.title}</div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <span>{new Date(ep.uploadDate).toLocaleDateString()}</span>
                <Link
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                  href={`/webtoon/${params.id}/episodes/${ep.idx}`}
                >
                  보기
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
