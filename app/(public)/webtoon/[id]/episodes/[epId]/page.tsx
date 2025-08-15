import dynamic from 'next/dynamic';
import ViewerNav from '@/components/public/ViewerNav';
import Image from 'next/image';
import { Suspense } from 'react';

// 댓글 컴포넌트 동적 임포트 + G: 쉼머 스켈레톤
const CommentSection = dynamic(() => import('@/components/viewer/CommentSection'), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse rounded-2xl border" />,
});

// 동적 메타데이터
export async function generateMetadata({ params }: { params: { id: string; epId: string } }) {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
    const res = await fetch(`${base}/api/episode/${params.id}/${params.epId}`, {
      // 상세는 SSR로 바로 읽으므로 캐시 자유롭게 조정 가능
      cache: 'no-store',
    });
    const raw = res.ok ? await res.json() : null;
    const title = raw?.episode?.title ?? raw?.title ?? `에피소드 ${params.epId}`;
    const thumb = raw?.episode?.thumbnailUrl ?? raw?.thumbnailUrl ?? '/og-episode.jpg';

    return {
      title: `${title} | 지니웹툰`,
      description: '에피소드 상세 및 댓글',
      openGraph: { images: [thumb] },
    };
  } catch {
    return {
      title: `에피소드 ${params.epId} | 지니웹툰`,
      description: '에피소드 상세 및 댓글',
    };
  }
}

async function getEpisode(webtoonId: string, episodeId: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/episode/${webtoonId}/${episodeId}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const raw = await res.json();

  // 서버 DTO가 달라도 안전하게 언랩/매핑
  const images: string[] = Array.isArray(raw?.images)
    ? raw.images
    : Array.isArray(raw?.cuts)
      ? raw.cuts
      : [];

  const ad =
    raw?.ad ??
    (raw?.advertisement
      ? { imageUrl: raw.advertisement.imageUrl, targetUrl: raw.advertisement.targetUrl }
      : undefined);

  const siblings = Array.isArray(raw?.siblings)
    ? raw.siblings
    : Array.isArray(raw?.episodes)
      ? raw.episodes
      : [];

  return { images, ad, siblings };
}

async function getNavigation(
  webtoonId: string,
  episodeId: string
): Promise<{ prevId: number | null; nextId: number | null }> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/episode/${webtoonId}/${episodeId}/navigation`, {
    cache: 'no-store',
  });
  if (!res.ok) return { prevId: null, nextId: null };

  const raw = await res.json();

  // 다양한 응답 케이스 허용
  if (typeof raw?.prevId !== 'undefined' || typeof raw?.nextId !== 'undefined') {
    return { prevId: raw.prevId ?? null, nextId: raw.nextId ?? null };
  }
  if (raw?.prev?.idx || raw?.next?.idx) {
    return { prevId: raw.prev?.idx ?? null, nextId: raw.next?.idx ?? null };
  }
  return { prevId: null, nextId: null };
}

async function getEpisodeSiblings(webtoonId: string): Promise<{ idx: number }[]> {
  // (선택) 기존 로직이 필요하면 남겨두되, 내비게이션 API를 우선 사용합니다.
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/webtoon/${webtoonId}/episodes`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const raw = await res.json();
  const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.episodes ?? []);
  return list.map((e: any) => ({ idx: e.idx ?? e.id }));
}

export default async function EpisodeViewer({ params }: { params: { id: string; epId: string } }) {
  const episode = await getEpisode(params.id, params.epId);

  // 1) 네비게이션 API 우선
  let { prevId, nextId } = await getNavigation(params.id, params.epId).catch(() => ({
    prevId: null,
    nextId: null,
  }));

  // 2) 폴백 (목록 or ±1)
  if (prevId === null && nextId === null) {
    try {
      const list = await getEpisodeSiblings(params.id); // { idx:number }[]
      const order = list.map((e: { idx: number }) => e.idx); // ← ts 타입 명시로 any 방지
      const i = order.indexOf(Number(params.epId));
      if (i > 0) prevId = order[i - 1];
      if (i >= 0 && i < order.length - 1) nextId = order[i + 1];
    } catch {
      const n = Number(params.epId);
      if (!Number.isNaN(n)) {
        prevId = n - 1 > 0 ? n - 1 : null;
        nextId = n + 1;
      }
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-3">
      <article className="space-y-4">
        {(episode?.images ?? []).map((src: string, i: number) => (
          <div key={i} className="relative h-auto w-full">
            <Image
              src={src}
              alt={`컷 ${i + 1}`}
              width={1200}
              height={0}
              sizes="100vw"
              className="h-auto w-full"
            />
          </div>
        ))}
        {/* 회차 마지막 광고 배너 자리 (클릭 시 기록용 링크) */}
        <a
          href={episode?.ad?.targetUrl ?? '#'}
          className="mt-8 block w-full overflow-hidden rounded-2xl border"
          target="_blank"
          rel="noopener noreferrer"
        >
          {episode?.ad?.imageUrl ? (
            <Image
              src={episode.ad.imageUrl}
              alt="advertisement"
              width={1200}
              height={200}
              className="h-auto w-full"
            />
          ) : (
            <div className="flex h-24 items-center justify-center text-zinc-500">광고 배너</div>
          )}
        </a>
      </article>

      <div className="my-6" />
      <ViewerNav webtoonId={params.id} prevEpId={prevId} nextEpId={nextId} />

      {/* 아래쪽 이전/이후 회차 바 (간단 미리보기) */}
      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold text-zinc-700">다른 회차</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(episode?.siblings ?? []).map((s: any) => (
            <a
              key={s.idx}
              href={`/webtoon/${params.id}/episodes/${s.idx}`}
              className="rounded-xl border bg-white p-3 hover:shadow"
            >
              <div className="truncate text-sm">{s.title}</div>
              <div className="text-xs text-zinc-500">
                {new Date(s.uploadDate).toLocaleDateString()}
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 동적 임포트 + Suspense, 폼 검증 & 접근성은 CommentSection 내부에서 처리됨 */}
      <section className="mt-10">
        <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl border" />}>
          {/* CommentSection: episodeId만 넘기면 됩니다. (아이콘, 검증/접근성 포함) */}
          <CommentSection episodeId={params.epId} />
        </Suspense>
      </section>
    </main>
  );
}
