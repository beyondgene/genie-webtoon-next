// app/(protected)/webtoon/[id]/page.tsx
import Link from 'next/link';
import db from '@/models';
import ImageFallBack from '@/components/ui/ImageFallBack';
import { Op, QueryTypes } from 'sequelize';
import ViewTracker from './ViewTracker';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';
import SubscribeControls from '@/components/webtoon/SubscribeControls';
import { toNumericId } from '@/lib/toNumericId';
import BackNavigator from '@/components/ui/BackNavigator';

export const revalidate = 300; // 5분 ISR

type PageProps = { params: { id: string } };

const SLUG_TO_KOR: Record<string, string> = {
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
// db에 영어로 저장된 장를 한국어 라벨로 변환하는 작업
const toGenreLabel = (v: unknown) =>
  SLUG_TO_KOR[String(v ?? '').toUpperCase()] ?? (String(v ?? '') || '장르');
// 썸네일 불러오고 처리하는 로직
function resolveThumb(u?: string | null, fallback = '/images/placeholder-webtoon.png') {
  const base = process.env.S3_PUBLIC_BASE || process.env.NEXT_PUBLIC_S3_PUBLIC_BASE || '';
  const v = (u || '').trim();
  if (!v) return fallback;
  if (/^https?:\/\//i.test(v)) return v;
  if (!base) return fallback;
  return `${base.replace(/\/$/, '')}/${v.replace(/^\/+/, '')}`;
}

export default async function WebtoonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params는 Promise이므로 await 필요
  const { id } = await params;

  // 숫자 id로 강제 변환 (객체/NaN 유입 차단)
  const wid = toNumericId(id);
  if (!wid) {
    return (
      <main className="min-h-screen bg-[#4f4f4f] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-16">
          <h1 className="text-xl sm:text-2xl font-semibold">잘못된 작품 ID입니다.</h1>
          <Link
            href="/"
            className="mt-4 sm:mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            홈으로
          </Link>
        </div>
      </main>
    );
  }
  const numId = wid;

  // [keep] 기존 모델 참조
  const { Webtoon, Episode, Artist, sequelize } = db as any;

  // 로그인 세션 (보호 라우트지만 방어코드 유지)
  const session = await getServerSession(authOptions);

  // 1) 웹툰
  const webtoon = await Webtoon.findOne({
    where: { idx: numId },
    attributes: ['idx', 'webtoonName', 'description', 'wbthumbnailUrl', 'genre', 'artistId'],
  });

  if (!webtoon) {
    return (
      <main className="min-h-screen bg-[#4f4f4f] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-16">
          <h1 className="text-xl sm:text-2xl font-semibold">작품을 찾을 수 없습니다.</h1>
          <Link
            href="/"
            className="mt-4 sm:mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  // 2) 작가
  const artist =
    typeof webtoon.artistId === 'number'
      ? await Artist.findByPk(webtoon.artistId, {
          attributes: ['idx', 'artistName', 'realName'],
        }).catch(() => null)
      : null;

  // 3) 에피소드 — 모델기반 + 실패시 SQL 우회 (기존 그대로)
  const eTable = Episode.getTableName?.() || Episode.tableName;
  const eAttrs = (Episode.getAttributes?.() || Episode.rawAttributes || {}) as Record<string, any>;
  console.log('[Episode] table =', eTable, 'attrs =', Object.keys(eAttrs));
  console.log('[DB] database =', sequelize?.config?.database);

  let episodes: any[] = await Episode.findAll({
    where: { webtoonId: webtoon.idx },
    attributes: ['idx', 'title', 'epthumbnailUrl', 'contentUrl', 'uploadDate'],
    order: [
      ['uploadDate', 'DESC'],
      ['idx', 'DESC'],
    ],
    paranoid: false,
  }).catch(() => []);

  console.log('[Episode] via model count =', episodes.length);

  if (episodes.length === 0) {
    const sql = `
      SELECT idx, title, epthumbnailUrl, contentUrl, uploadDate
      FROM episode
      WHERE webtoonId = ?
      ORDER BY uploadDate DESC, idx DESC
    `;
    episodes = await sequelize
      .query(sql, {
        replacements: [webtoon.idx],
        type: QueryTypes.SELECT,
      })
      .catch(() => []);
    console.log('[Episode] via RAW SQL count =', episodes.length);
  }

  const title = webtoon.webtoonName || '제목 미상';
  const description = webtoon.description || '작품 소개가 준비중입니다.';
  const posterSrc = resolveThumb(webtoon.wbthumbnailUrl);
  const genreLabel = toGenreLabel(webtoon.genre);
  const genreHref =
    genreLabel && genreLabel !== '장르' ? `/genre/${encodeURIComponent(genreLabel)}` : '/genre';

  return (
    <main className="min-h-screen bg-[#4f4f4f] text-white">
      <BackNavigator href={genreHref} />
      <ViewTracker webtoonId={numId} />

      {/* 모바일 우선 레이아웃 */}
      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 py-6 sm:py-12">
        {/* 모바일: 세로 스택, 데스크톱: 그리드 */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
          {/* 포스터 섹션 */}
          <section className="w-full lg:col-span-6">
            {/* 모바일에서 더 작은 포스터 */}
            <div className="w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[533px] mx-auto">
              <div
                className="w-full rounded-2xl overflow-hidden shadow-md"
                style={{ aspectRatio: '533 / 678' }}
              >
                <ImageFallBack
                  src={posterSrc}
                  alt={title}
                  className="block h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* 제목 및 정보 섹션 */}
            <div className="mt-6 sm:mt-8 text-center px-2">
              {/* 모바일에서 제목과 버튼을 세로로 배치 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">{title}</h1>
                <div className="flex-shrink-0">
                  <SubscribeControls webtoon={numId} />
                </div>
              </div>

              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/80">
                글 {artist?.artistName || artist?.realName || '작가 미상'} / 장르 {genreLabel}
              </p>

              {/* 설명 텍스트 모바일에서 더 컴팩트하게 */}
              <div className="mt-4 sm:mt-6">
                <p className="whitespace-pre-line text-xs sm:text-sm leading-5 sm:leading-6 text-white/90 max-w-prose mx-auto">
                  {description}
                </p>
              </div>
            </div>
          </section>

          {/* 에피소드 섹션 */}
          <aside className="w-full lg:col-span-6">
            {/* 모바일에서 높이 조절 및 전체 너비 사용 */}
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-[1px] overflow-hidden">
              {/* 모바일에서 더 작은 높이, 태블릿에서 중간, 데스크톱에서 큰 높이 */}
              <div className="h-[300px] sm:h-[400px] md:h-[500px] lg:h-[678px] overflow-y-auto">
                {episodes.length === 0 ? (
                  <div className="p-4 sm:p-6 text-xs sm:text-sm text-white/80 text-center">
                    등록된 에피소드가 없습니다.
                  </div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {episodes.map((ep: any, i: number) => {
                      const thumb = resolveThumb(
                        ep.epthumbnailUrl,
                        '/images/placeholder-webtoon.png'
                      );
                      const webtoonId = numId;
                      const epTitle = ep.title || `Ep. ${episodes.length - i}`;
                      const href = `/webtoon/${webtoonId}/episodes/${ep.idx}`;

                      return (
                        <li key={ep.idx}>
                          <Link
                            href={href}
                            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/10 transition-colors duration-200 active:bg-white/20"
                          >
                            {/* 모바일에서 더 작은 썸네일 */}
                            <div
                              className="flex-shrink-0 overflow-hidden rounded-md w-[72px] h-[40px] sm:w-[96px] sm:h-[54px]"
                              style={{ aspectRatio: '16 / 9' }}
                            >
                              <ImageFallBack
                                src={thumb}
                                alt={epTitle}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs sm:text-sm font-medium text-white">
                                {epTitle}
                              </div>
                              <div className="mt-1 text-xs text-white/70">
                                {new Date(ep.uploadDate || Date.now()).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
