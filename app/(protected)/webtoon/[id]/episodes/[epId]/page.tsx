// app/(protected)/webtoon/[id]/episodes/[epId]/page.tsx
import EpisodeViewer from '@/components/viewer/EpisodeViewer';
import CommentSection from '@/components/viewer/CommentSection'; // 추가
import { headers, cookies } from 'next/headers';

export const revalidate = 60; // 페이지 자체도 1분 기준 ISR
export const preferredRegion = ['icn1', 'hnd1'];

// env파일에 있는 baseUrl 호출해오는 로직
async function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  return env ? env.replace(/\/$/, '') : '';
}
// 현재 페이지 쿠키 호출해서 저장
async function getCookieHeader() {
  const c = await cookies();
  return c
    .getAll()
    .map((ck) => `${ck.name}=${ck.value}`)
    .join('; ');
}

export default async function Page({ params }: { params: Promise<{ id: string; epId: string }> }) {
  const { id, epId } = await params;
  const webtoonId = Number(id);
  const episodeId = Number(epId);
  const base = await getBaseUrl();
  const cookie = await getCookieHeader();
  // 에피소드 기반으로 baseUrl에 해당 화면들 표시
  const [episodeRes, listRes, adRes] = await Promise.all([
    fetch(`${base}/api/episode/${webtoonId}/${episodeId}`, {
      cache: 'no-store',
      headers: { cookie },
    }),
    fetch(`${base}/api/episode/${webtoonId}?limit=500`, { cache: 'no-store', headers: { cookie } }),
    fetch(
      `${base}/api/advertisement/episode-bottom?webtoonId=${webtoonId}&episodeId=${episodeId}`,
      { next: { revalidate: 30, tags: ['ad:episode-bottom'] } }
    ),
  ]);

  // 에피소드, 리스트, 광고 순으로 나열.
  const [episodeJson, listJson, adJson] = await Promise.all([
    episodeRes.ok ? episodeRes.json().catch(() => null) : null,
    listRes.ok ? listRes.json().catch(() => null) : null,
    adRes.ok ? adRes.json().catch(() => null) : null,
  ]);

  const episode = episodeJson?.data ?? episodeJson;
  const episodes = listJson?.data ?? listJson ?? [];
  const ad = adJson?.data ?? adJson ?? null;
  //웹툰 뷰어 컴포넌트 호출해서 웹툰 뷰어 페이지 작성
  return (
    /* 뷰어 화면 전체: 어떤 모드/브라우저에서도 화이트 고정 */
    <div className="viewer-light min-h-dvh w-full bg-white text-gray-900">
      {/* 에피소드 본문 */}
      <section className="bg-white">
        <EpisodeViewer
          webtoonId={webtoonId}
          episodeId={episodeId}
          episode={episode}
          episodes={episodes}
          ad={ad}
        />
      </section>
      {/* 본문과 댓글 사이 여백도 흰색으로 고정(검은 띠 예방) */}
      <div className="h-4 sm:h-6 bg-white" />

      {/* 댓글 섹션 (래퍼도 화이트 보강) */}
      <section className="mx-auto w-full max-w-3xl px-4 py-10 bg-white">
        <CommentSection webtoonId={webtoonId} episodeId={episodeId} />
      </section>
    </div>
  );
}
