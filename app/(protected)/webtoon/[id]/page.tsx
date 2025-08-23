// app/(protected)/webtoon/[id]/page.tsx
import Link from 'next/link';
import db from '@/models';
import ImageFallBack from '@/components/ui/ImageFallBack';
import { Op, QueryTypes } from 'sequelize';

export const dynamic = 'force-dynamic';

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
const toGenreLabel = (v: unknown) =>
  SLUG_TO_KOR[String(v ?? '').toUpperCase()] ?? (String(v ?? '') || '장르');

function resolveThumb(u?: string | null, fallback = '/images/placeholder-webtoon.png') {
  const base = process.env.S3_PUBLIC_BASE || process.env.NEXT_PUBLIC_S3_PUBLIC_BASE || '';
  const v = (u || '').trim();
  if (!v) return fallback;
  if (/^https?:\/\//i.test(v)) return v;
  if (!base) return fallback;
  return `${base.replace(/\/$/, '')}/${v.replace(/^\/+/, '')}`;
}

export default async function WebtoonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);

  const { Webtoon, Episode, Artist, sequelize } = db as any;

  // 1) 웹툰
  const webtoon = await Webtoon.findOne({
    where: { idx: numId },
    attributes: ['idx', 'webtoonName', 'description', 'wbthumbnailUrl', 'genre', 'artistId'],
  });

  if (!webtoon) {
    return (
      <main className="min-h-screen bg-[#929292] text-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-2xl font-semibold">작품을 찾을 수 없습니다.</h1>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
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

  // 3) 에피소드 — 모델기반 + 실패시 SQL 우회
  // 3-1) 모델 속성/테이블 진단 로그
  const eTable = Episode.getTableName?.() || Episode.tableName;
  const eAttrs = (Episode.getAttributes?.() || Episode.rawAttributes || {}) as Record<string, any>;
  console.log('[Episode] table =', eTable, 'attrs =', Object.keys(eAttrs));
  console.log('[DB] database =', sequelize?.config?.database);

  // 3-2) 일반 조회
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

  // 3-3) 비면 원시 SQL로 강제 조회 (모델 매핑 오류 진단용)
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

  return (
    <main className="min-h-screen bg-[#929292] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* 왼쪽 */}
          <section className="col-span-12 lg:col-span-6">
            <div
              className="w-full md:max-w-[533px] rounded-2xl overflow-hidden shadow-md"
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
            <div className="mt-8 text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="mt-4 text-sm text-white/80">
                글 {artist?.artistName || artist?.realName || '작가 미상'} / 장르 {genreLabel}
              </p>
              <p className="mt-6 whitespace-pre-line text-sm leading-6 text-white/90">
                {description}
              </p>
            </div>
          </section>

          {/* 오른쪽: 에피소드 */}
          <aside className="col-span-12 lg:col-span-6">
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-[1px] overflow-hidden h-[420px] md:h-[678px] w-full md:max-w-[722px] mt-6 md:mt-[154px]">
              <div className="max-h-full overflow-y-auto">
                {episodes.length === 0 ? (
                  <div className="p-6 text-sm text-white/80">등록된 에피소드가 없습니다.</div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {episodes.map(async (ep: any, i: number) => {
                      const thumb = resolveThumb(
                        ep.epthumbnailUrl,
                        '/images/placeholder-webtoon.png'
                      );
                      const webtoonId = Number((await params)?.id ?? webtoon?.idx ?? webtoon?.id);
                      const epTitle = ep.title || `Ep. ${episodes.length - i}`;
                      const href = `/webtoon/${webtoonId}/episodes/${ep.idx}`;
                      return (
                        <li key={ep.idx}>
                          <Link
                            href={href}
                            className="flex items-center gap-3 px-3 py-3 hover:bg-white/10 transition"
                          >
                            <div
                              className="flex-shrink-0 overflow-hidden rounded-md"
                              style={{ width: 96, height: 54, aspectRatio: '16 / 9' }}
                            >
                              <ImageFallBack
                                src={thumb}
                                alt={epTitle}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-white">
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
