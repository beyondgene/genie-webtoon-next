import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { getWeeklyRanking } from '@/controllers/ranking'
import { getSubscriptionStatusForList } from '@/controllers/subscription'

interface RankingWebtoon {
  idx: number
  webtoonName: string
  artistName: string
  genre: string
  weeklyViews: number
}

interface SubscriptionStatus {
  webtoonId: number
  alarm_on: boolean
}

export async function GET(
  req: NextRequest,
  { params }: { params: { genre: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const { genre } = params

  try {
    const webtoons: RankingWebtoon[] = await getWeeklyRanking(genre)
    const ids: number[] = webtoons.map((w) => w.idx)
    const subs: SubscriptionStatus[] = await getSubscriptionStatusForList(userId, ids)
    const subsMap: Map<number, boolean> = new Map(
      subs.map((s) => [s.webtoonId, s.alarm_on])
    )

    const result = webtoons.map((w, i) => ({
      rank: i + 1,
      id: w.idx,
      name: w.webtoonName,
      artist: w.artistName,
      genre: w.genre,
      views: w.weeklyViews,
      isSubscribed: subsMap.has(w.idx),
      alarmOn: subsMap.get(w.idx) ?? false,
    }))

    return NextResponse.json({ genre, period: 'weekly', webtoons: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
