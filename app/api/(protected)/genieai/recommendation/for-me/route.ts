import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import db from '@/models';
import { requireAuth } from '@/lib/middlewares/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// 정보 타입 row 설정
type Row = {
  idx: number;
  webtoonName: string;
  genre: string;
  views: number;
  wbthumbnailUrl?: string | null;
  description?: string | null; // 모델 필드(= DB discription 매핑)
};
// 웹툰 속성으로 사용하는 속성들 정의
const WEBTOON_ATTRS = [
  'idx',
  'webtoonName',
  'genre',
  'views',
  'wbthumbnailUrl',
  'description', // 모델에서 discription 컬럼에 매핑되어 있어야 함
] as const;
// item으로 변환하는 함수
function toItem(r: Row) {
  const desc = r.description ?? '';
  return {
    id: r.idx,
    title: r.webtoonName,
    genre: r.genre,
    views: Number(r.views ?? 0),
    thumbnail: r.wbthumbnailUrl ?? '',
    // 프런트 호환 위해 둘 다 제공
    description: desc,
  };
}

// 나의 구독 여부를 통해 추천하는 get 핸들러
export async function GET(req: NextRequest) {
  const authed = await requireAuth(req);
  if (authed instanceof NextResponse) return authed;

  const memberIdx = (authed as any).id as number;

  try {
    // 1) 구독 테이블에서 직접 구독 웹툰 ID 수집
    const subs = await db.Subscription.findAll({
      where: {
        memberId: memberIdx,
        status: 'ACTIVE', // 활성 구독만 고려
      },
      attributes: ['webtoonId'],
      raw: true,
    });

    const subscribedIds = Array.from(
      new Set((subs ?? []).map((s: any) => Number(s.webtoonId)).filter(Number.isFinite))
    );

    let items: Row[] = [];

    if (subscribedIds.length > 0) {
      // 2) 내가 구독한 작품들의 장르 수집
      const genresRows: Array<{ genre: string }> = await db.Webtoon.findAll({
        where: { idx: { [Op.in]: subscribedIds } },
        attributes: ['genre'],
        raw: true,
      });
      const genres = Array.from(new Set(genresRows.map((g) => String(g.genre)).filter(Boolean)));

      // 3) 동일 장르의 "다른" 작품(구독작 제외) - 명시적으로 NOT IN 조건 추가
      if (genres.length > 0) {
        items = (await db.Webtoon.findAll({
          where: {
            genre: { [Op.in]: genres },
            idx: { [Op.notIn]: subscribedIds }, // 구독한 웹툰 제외
          },
          order: [['views', 'DESC']],
          limit: 10,
          attributes: WEBTOON_ATTRS as any,
          raw: true,
        })) as any;
      }

      // 4) 동일 장르 대안이 없으면 전체 TOP(구독작 제외)
      if (items.length === 0) {
        items = (await db.Webtoon.findAll({
          where: {
            idx: { [Op.notIn]: subscribedIds }, // 구독한 웹툰 제외
          },
          order: [['views', 'DESC']],
          limit: 10,
          attributes: WEBTOON_ATTRS as any,
          raw: true,
        })) as any;
      }
    } else {
      // 5) 구독 이력이 없으면 전체 TOP
      items = (await db.Webtoon.findAll({
        order: [['views', 'DESC']],
        limit: 10,
        attributes: WEBTOON_ATTRS as any,
        raw: true,
      })) as any;
    }

    // 6) 추가 안전 장치 - 혹시 DB 쿼리에서 제외가 안 된 경우를 대비한 필터링
    const filtered =
      subscribedIds.length > 0 ? items.filter((w) => !subscribedIds.includes(w.idx)) : items;

    // 7) 구독한 웹툰이 결과에 포함되지 않았는지 재검증
    const finalCheck = filtered.some((w) => subscribedIds.includes(w.idx));

    return NextResponse.json(filtered.map(toItem), { status: 200 });
  } catch (err: any) {
    console.error('[recommend/for-me] error:', err);
    return NextResponse.json(
      { error: 'Server error', details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
