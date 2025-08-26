// app/(protected)/(member)/bookmarks/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';
import db from '@/models';
import { QueryTypes } from 'sequelize';
import BookmarksListClient from './BookmarksListClient';

export const dynamic = 'force-dynamic';

type Row = {
  subscriptionIdx: number;
  alarmOn: 0 | 1 | boolean;
  webtoonId: number;
  webtoonName: string;
  wbthumbnailUrl?: string | null;
  genre?: string;
  views?: number;
  recommend?: number;
};

export default async function MyBookmarksPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const memberId = Number((session.user as any)?.idx ?? (session.user as any)?.id);
  if (!memberId) redirect('/login');

  // ✅ 서버에서 DB 직조회 (API 우회)
  const rows = await db.sequelize.query<Row>(
    `
    SELECT
      s.idx AS subscriptionIdx,
      s.alarm_on AS alarm_on,
      w.idx AS webtoonId,
      w.webtoonName,
      w.wbthumbnailUrl,
      w.genre,
      w.views,
      w.recommend
    FROM subscription s
    JOIN webtoon w ON w.idx = s.webtoonId
    WHERE s.memberId = ? AND s.status = 'ACTIVE'
    ORDER BY w.recommend DESC, w.views DESC
    `,
    { replacements: [memberId], type: QueryTypes.SELECT }
  );

  const items = rows.map((x) => ({
    idx: Number(x.subscriptionIdx ?? x.webtoonId),
    webtoonId: Number(x.webtoonId),
    webtoonName: x.webtoonName ?? '',
    wbthumbnailUrl: x.wbthumbnailUrl ?? undefined,
    genre: x.genre,
    views: x.views,
    recommend: x.recommend,
    alarmOn: x.alarmOn === true || x.alarmOn === 1,
  }));

  return (
    <div className="page-on-gray">
      <section className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <h1 className="mb-4 text-xl font-semibold md:text-2xl">북마크</h1>
        <BookmarksListClient items={items} />
      </section>
    </div>
  );
}
