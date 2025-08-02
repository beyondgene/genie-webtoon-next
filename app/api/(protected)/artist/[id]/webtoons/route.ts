// app/api/(protected)/artist/[id]/webtoons/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import db from '@/models'
import { getSubscriptionStatusForList } from '@/controllers/subscription'

interface WebtoonByArtist {
  idx: number
  webtoonName: string
  discription: string
  genre: string
  thumbnailUrl: string
  views: number
  recommend: number
}

interface SubscriptionStatus {
  webtoonId: number
  alarm_on: boolean
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number
  const artistId = parseInt(params.id, 10)

  try {
    // 1) 해당 작가의 웹툰 조회
    const webtoons: WebtoonByArtist[] = await db.WEBTOON.findAll({
      where: { artistIdx: artistId },
      attributes: [
        'idx',
        'webtoonName',
        'discription',
        'genre',
        'thumbnailUrl',
        'views',
        'recommend',
      ],
      order: [['createdAt', 'DESC']],
      raw: true,
    })

    // 2) 구독 상태 조회
    const ids = webtoons.map((w) => w.idx)
    const subs = await getSubscriptionStatusForList(memberId, ids)

    // 3) Map 생성
    const subsMap = new Map<number, boolean>(
      (subs as SubscriptionStatus[]).map((s) => [s.webtoonId, s.alarm_on])
    )

    // 4) DTO 변환
    const result = webtoons.map((w) => ({
      id: w.idx,
      name: w.webtoonName,
      description: w.discription,
      genre: w.genre,
      thumbnailUrl: w.thumbnailUrl,
      views: w.views,
      recommend: w.recommend,
      isSubscribed: subsMap.has(w.idx),
      alarmOn: subsMap.get(w.idx) ?? false,
    }))

    return NextResponse.json({ webtoons: result })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '작가 웹툰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
