// app/api/(protected)/genre/[genre]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getWebtoonsByGenre } from '@/controllers/genre/byGenreController';
import { getSubscriptionStatusForList } from '@/controllers/subscription';

interface LocalWebtoon {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  description: string;
  isSubscribed: boolean;
  alarmOn: boolean;
}

export async function GET(req: NextRequest, { params }: { params: { genre: string } }) {
  // 로그인 검사
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;
  const memberId = sessionOrRes.id as number;

  try {
    const genreName = params.genre;
    const webtoons = await getWebtoonsByGenre(genreName);

    // 구독 상태 조회
    const subsList = await getSubscriptionStatusForList(
      memberId,
      webtoons.map((w) => w.idx)
    );
    const subsMap = new Map<number, boolean>(
      subsList.map((s: { webtoonIdx: any; alarmOn: boolean }) => [
        s.webtoonIdx,
        s.alarmOn as boolean,
      ])
    );

    const result: LocalWebtoon[] = webtoons.map((w) => ({
      idx: w.idx,
      webtoonName: w.webtoonName,
      thumbnailUrl: w.thumbnailUrl,
      description: w.discription,
      isSubscribed: subsMap.has(w.idx),
      alarmOn: Boolean(subsMap.get(w.idx)),
    }));

    return NextResponse.json({ genre: genreName, webtoons: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? '장르별 웹툰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
