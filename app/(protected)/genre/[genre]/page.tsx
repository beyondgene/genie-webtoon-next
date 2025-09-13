import Link from 'next/link';
import db from '@/models';
import ImageFallback from '@/components/ui/ImageFallBack';
import BackNavigator from '@/components/ui/BackNavigator';
import SpeechBubble from '@/components/ui/SpeechBubble';

export const revalidate = 300; // 5분 단위 ISR
export const preferredRegion = ['icn1', 'hnd1'];

function resolveThumb(u?: string | null) {
  const base = process.env.S3_PUBLIC_BASE || process.env.NEXT_PUBLIC_S3_PUBLIC_BASE || '';
  const v = (u || '').trim();
  if (!v) return '/images/placeholder-webtoon.png';
  if (/^https?:\/\//i.test(v)) return v;
  if (!base) return '/images/placeholder-webtoon.png';
  return `${base.replace(/\/$/, '')}/${v.replace(/^\/+/, '')}`;
}

type GenreSlug =
  | 'DRAMA'
  | 'ROMANCE'
  | 'FANTASY'
  | 'ACTION'
  | 'LIFE'
  | 'GAG'
  | 'SPORTS'
  | 'THRILLER'
  | 'HISTORICAL';
// 장르 한->영 번역 레이블
const KOR_TO_SLUG: Record<string, GenreSlug> = {
  드라마: 'DRAMA',
  로맨스: 'ROMANCE',
  로멘스: 'ROMANCE', // 오타 허용
  판타지: 'FANTASY',
  액션: 'ACTION',
  일상: 'LIFE',
  개그: 'GAG',
  코미디: 'GAG',
  스포츠: 'SPORTS',
  스릴러: 'THRILLER',
  사극: 'HISTORICAL',
  역사: 'HISTORICAL',
  '무협-사극': 'HISTORICAL',
  '무협/사극': 'HISTORICAL',
};
// 장르 영->한 번역 레이블
const SLUG_TO_KOR: Record<GenreSlug, string> = {
  DRAMA: '드라마',
  ROMANCE: '로맨스',
  FANTASY: '판타지',
  ACTION: '액션',
  LIFE: '일상',
  GAG: '개그',
  SPORTS: '스포츠',
  THRILLER: '스릴러',
  HISTORICAL: '사극',
};
// 허용된 장르 리스트업
const ALLOWED = new Set<GenreSlug>([
  'DRAMA',
  'ROMANCE',
  'FANTASY',
  'ACTION',
  'LIFE',
  'GAG',
  'SPORTS',
  'THRILLER',
  'HISTORICAL',
]);
// URI 오류시 에러 잡는 함수
function safeDecode(s: string) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
// 장르별에 호버후 해당하는 장르의 DB에 있는 웹툰 카드들을 불러오는 과정
export default async function GenrePage({
  params,
  searchParams,
}: {
  // Next 15: Promise로 들어옴
  params: Promise<{ genre: string | string[] }>;
  searchParams: Promise<{ page?: string }>;
}) {
  // 1) params / searchParams 대기
  const { genre: genreParam } = await params;
  const { page: pageParam } = await searchParams;

  // 2) 한글·영문 어떤 값이 와도 안전하게 디코드
  const raw = safeDecode(Array.isArray(genreParam) ? genreParam[0] : genreParam);

  // 3) 한글 → 영문 슬러그 매핑 (없으면 대문자 영문으로 시도)
  const maybe = (KOR_TO_SLUG[raw] ?? raw.toUpperCase()) as string;
  const slug = (ALLOWED.has(maybe as GenreSlug) ? (maybe as GenreSlug) : null) as GenreSlug | null;
  const label = slug ? SLUG_TO_KOR[slug] : raw;

  // 4) 페이지네이션 파라미터
  const page = Math.max(parseInt(pageParam ?? '1', 10) || 1, 1);
  const pageSize = 9;

  // 5) 유효하지 않은 장르 처리
  if (!slug) {
    return (
      <main className="min-h-screen bg-[#9f9f9f] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-2xl font-semibold">알 수 없는 장르입니다.</h1>
          <p className="mt-2 opacity-90">입력: {raw}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  // 6) DB 조회 (genre 컬럼은 영문 슬러그로 저장되어 있다고 가정)
  const offset = (page - 1) * pageSize;
  const { Webtoon } = db as any;
  const { rows, count } = (await Webtoon.findAndCountAll({
    where: { genre: slug },
    // 실제 존재하는 컬럼만 선택
    attributes: ['idx', 'webtoonName', 'wbthumbnailUrl', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit: pageSize,
    offset,
  })) as {
    rows: Array<{ idx: number; webtoonName: string; wbthumbnailUrl: string }>;
    count: number;
  };

  const totalPages = Math.max(Math.ceil(count / pageSize), 1);
  const hrefGenre = encodeURIComponent(raw); // 디코딩된 값만 한 번 인코딩

  return (
    <main className="min-h-screen bg-[#4f4f4f] text-white">
      {/* 기존 main bg-[9f9f9f] */}
      <BackNavigator href="/home" />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* 왼쪽: 선택된 장르 멘트 */}
          <aside className="col-span-12 md:col-span-3 md:sticky md:top-8 md:h-fit">
            <SpeechBubble
              fill="transparent" // 내부 배경은 그대로, 테두리만 #ff6d00
              thickness={5} // 선 두께 업
              tailSize={12}
              tailOffset={14}
              className="block w-full rounded-3xl p-6 md:p-7"
            >
              <p className="text-sm uppercase tracking-widest text-white/80">Selected Genre</p>
              <h1 className="mt-1 text-3xl font-bold text-[#ff6d00]">{label}</h1>
              <p className="mt-4 text-white/80">
                {label} 장르의 작품들을 3×3 썸네일로 모아봤어요. 더 많은 작품은 페이지 넘김으로
                확인해보세요!
              </p>
            </SpeechBubble>
          </aside>

          {/* 오른쪽: 3x3 그리드 + 페이지네이션 */}
          <section className="col-span-12 md:col-span-9">
            {rows.length === 0 ? (
              <div className="rounded-3xl border border-white/20 p-10 text-center">
                <div className="text-lg font-medium">아직 등록된 작품이 없어요.</div>
                <div className="mt-2 text-sm text-white/80">다른 장르도 둘러보세요.</div>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
                  >
                    홈으로
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mx-auto max-w-[960px] grid grid-cols-2 md:grid-cols-3 gap-4">
                  {rows.map((w) => {
                    const webtoonId = w.idx;
                    if (!webtoonId) return null;

                    return (
                      <Link
                        key={webtoonId}
                        href={`/webtoon/${webtoonId}`}
                        className="group relative block overflow-hidden rounded-2xl"
                        aria-label={`${w.webtoonName} 보러가기`}
                      >
                        <div
                          className="w-full overflow-hidden rounded-2xl"
                          style={{ aspectRatio: '3 / 4' }}
                        >
                          <ImageFallback
                            src={resolveThumb(w.wbthumbnailUrl)}
                            alt={w.webtoonName}
                            className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            decoding="async"
                            fallbackSrc="/images/placeholder-webtoon.png"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                          <div className="truncate text-sm font-medium text-white drop-shadow">
                            {w.webtoonName}
                          </div>
                        </div>
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-white/0 transition duration-300 group-hover:ring-2 group-hover:ring-white/60" />
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-white/80">
                    총 {count}개 작품 · {page}/{totalPages} 페이지
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/genre/${hrefGenre}?page=${Math.max(page - 1, 1)}`}
                      aria-disabled={page <= 1}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        page <= 1
                          ? 'cursor-not-allowed border border-white/20 text-white/40'
                          : 'border border-white bg-white text-black hover:opacity-90'
                      }`}
                    >
                      이전
                    </Link>
                    <Link
                      href={`/genre/${hrefGenre}?page=${Math.min(page + 1, totalPages)}`}
                      aria-disabled={page >= totalPages}
                      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        page >= totalPages
                          ? 'cursor-not-allowed border border-white/20 text-white/40'
                          : 'border border-white bg-white text-black hover:opacity-90'
                      }`}
                    >
                      다음
                    </Link>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
