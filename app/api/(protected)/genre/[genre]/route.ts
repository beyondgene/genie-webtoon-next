import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middlewares/auth';
import { getWebtoonsByGenre } from '@/controllers/genre/byGenreController';
import { getBookmarkStatusForList, BookmarkStatus } from '@/controllers/member/bookmarksController';

type LocalWebtoon = {
  idx: number;
  webtoonName: string;
  thumbnailUrl: string;
  description: string;
  isSubscribed: boolean;
  alarmOn: boolean;
};

export async function GET(req: NextRequest, { params }: { params: { genre: string } }) {
  const sessionOrRes = await requireAuth(req);
  if (sessionOrRes instanceof NextResponse) return sessionOrRes;

  const memberId = sessionOrRes.id as number;

  try {
    const genreName = params.genre;
    if (!genreName) {
      return NextResponse.json(
        { code: 'GENRE-400', message: '장르 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const webtoons = await getWebtoonsByGenre(genreName);
    const webtoonIds = webtoons.map((w: any) => Number(w.idx));

    const marks: BookmarkStatus[] = await getBookmarkStatusForList(memberId, webtoonIds);

    const markMap = new Map<number, { isSubscribed: boolean; alarmOn: boolean }>();
    for (const m of marks) {
      markMap.set(m.webtoonId, { isSubscribed: m.isSubscribed, alarmOn: m.alarmOn });
    }

    const result: LocalWebtoon[] = webtoons.map((w: any) => {
      const mark = markMap.get(Number(w.idx));
      return {
        idx: Number(w.idx),
        webtoonName: String(w.webtoonName),
        thumbnailUrl: String(w.thumbnailUrl ?? w.thumnailUrl ?? ''), // 스키마 오타 대비
        description: String(w.description ?? w.discription ?? ''),
        isSubscribed: mark?.isSubscribed ?? false,
        alarmOn: mark?.alarmOn ?? false,
      };
    });

    return NextResponse.json({ code: 'OK', result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { code: 'GENRE-500', message: '장르별 웹툰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
