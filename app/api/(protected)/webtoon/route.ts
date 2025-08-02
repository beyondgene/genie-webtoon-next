import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { Webtoon, Artist } from '@/models/webtoon'
import { Subscription } from '@/models/subscription'

interface WebtoonListDTO {
  id: number
  name: string
  description: string
  genre: string
  thumbnailUrl: string
  views: number
  recommend: number
  artistName: string
  isSubscribed: boolean
  alarmOn: boolean
  createdAt: string
  updatedAt: string
}

export async function GET(req: NextRequest) {
  // 1) 로그인 검사
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number

  // 2) 웹툰 전체 목록 조회 (최신순)
  const webtoons = await Webtoon.findAll({
    include: [{ model: Artist, attributes: ['artistName'] }],
    attributes: [
      'idx',
      'webtoonName',
      'discription',
      'genre',
      'thumbnailUrl',
      'views',
      'recommend',
      'createdAt',
      'updatedAt',
    ],
    order: [['createdAt', 'DESC']],
    raw: true,
    nest: true,
  })

  // 3) 구독 상태 조회
  const ids = webtoons.map((w) => w.idx)
  const subs = await Subscription.findAll({
    where: { memberId, webtoonId: ids, status: 'ACTIVE' },
    attributes: ['webtoonId', 'alarm_on'],
    raw: true,
  })
  const subsMap = new Map<number, boolean>(subs.map((s) => [s.webtoonId, !!s.alarm_on]))

  // 4) DTO 변환
  const result: WebtoonListDTO[] = webtoons.map((w) => ({
    id: w.idx,
    name: w.webtoonName,
    description: w.discription,
    genre: w.genre,
    thumbnailUrl: w.thumbnailUrl,
    views: w.views,
    recommend: w.recommend,
    artistName: w.Artist.artistName,
    isSubscribed: subsMap.has(w.idx),
    alarmOn: subsMap.get(w.idx) ?? false,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }))

  return NextResponse.json({ webtoons: result })
}
