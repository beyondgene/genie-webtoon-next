import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { Webtoon } from '@/models/webtoon';
import { Artist } from '@/models/artist';
import { Subscription } from '@/models/subscription';

// 백엔드에 코드 전달을 위한 웹툰 리스트 데이터 타입 인터페이스
interface WebtoonListDTO {
  id: number;
  name: string;
  description: string;
  genre: string;
  views: number;
  recommend: number;
  artistName: string;
  isSubscribed: boolean;
  alarmOn: boolean;
  createdAt: string;
  updatedAt: string;
}

// 백엔드에 코드 전달을 위한 웹툰 상세 데이터 타입 인터페이스
interface WebtoonDetailDTO {
  id: number;
  name: string;
  description: string;
  genre: string;
  views: number;
  recommend: number;
  artistName: string;
  createdAt: string;
  updatedAt: string;
  subscription: {
    isSubscribed: boolean;
    alarmOn: boolean;
  };
}
// 웹툰 리스트를 불러오는 함수
export async function getWebtoonList(req: NextRequest) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  const webtoons = await Webtoon.findAll({
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: [
      'idx',
      'webtoonName',
      'description',
      'genre',
      'views',
      'recommend',
      'createdAt',
      'updatedAt',
    ],
    order: [['createdAt', 'DESC']],
    raw: true,
    nest: true,
  });
  // db에서 구독 테이블의 'webtoonId', 'alarm_on'속성을 기준으로 컬럼들을 검색하고 해당 값을 기준으로 값을 반환
  const ids = webtoons.map((w) => w.idx);
  const subs = await Subscription.findAll({
    where: { memberId, webtoonId: ids, status: 'ACTIVE' },
    attributes: ['webtoonId', 'alarm_on'],
    raw: true,
  });
  const subsMap = new Map<number, boolean>(subs.map((s) => [s.webtoonId, !!s.alarm_on]));

  const result: WebtoonListDTO[] = webtoons.map((w) => ({
    id: w.idx,
    name: w.webtoonName,
    description: w.description,
    genre: w.genre,
    views: w.views,
    recommend: w.recommend,
    artistName: w.Artist!.artistName,
    isSubscribed: subsMap.has(w.idx),
    alarmOn: subsMap.get(w.idx) ?? false,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }));

  return NextResponse.json({ webtoons: result });
}
// 웹툰의 상세 속성과 정보를 불러오는 함수
export async function getWebtoonDetail(req: NextRequest, webtoonId: number) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;
  // db에서 웹툰 테이블의 'artistName'속성을 기준으로 컬럼들을 검색하고 해당 값을 기준으로 값을 반환
  const w = await Webtoon.findByPk(webtoonId, {
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: [
      'idx',
      'webtoonName',
      'description',
      'genre',
      'views',
      'recommend',
      'createdAt',
      'updatedAt',
    ],
    raw: true,
    nest: true,
  });

  if (!w) {
    return NextResponse.json({ error: '웹툰을 찾을 수 없습니다.' }, { status: 404 });
  }

  const sub = await Subscription.findOne({
    where: { memberId, webtoonId, status: 'ACTIVE' },
    attributes: ['alarm_on'],
    raw: true,
  });

  const detail: WebtoonDetailDTO = {
    id: w.idx,
    name: w.webtoonName,
    description: w.description,
    genre: w.genre,
    views: w.views,
    recommend: w.recommend,
    artistName: w.Artist!.artistName,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    subscription: {
      isSubscribed: !!sub,
      alarmOn: sub?.alarm_on ?? false,
    },
  };

  return NextResponse.json(detail);
}
