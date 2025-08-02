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

interface WebtoonDetailDTO {
  id: number
  name: string
  description: string
  genre: string
  thumbnailUrl: string
  views: number
  recommend: number
  artistName: string
  createdAt: string
  updatedAt: string
  subscription: {
    isSubscribed: boolean
    alarmOn: boolean
  }
}

export async function getWebtoonList(req: NextRequest) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number

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

  const ids = webtoons.map((w) => w.idx)
  const subs = await Subscription.findAll({
    where: { memberId, webtoonId: ids, status: 'ACTIVE' },
    attributes: ['webtoonId', 'alarm_on'],
    raw: true,
  })
  const subsMap = new Map<number, boolean>(subs.map((s) => [s.webtoonId, !!s.alarm_on]))

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

export async function getWebtoonDetail(req: NextRequest, webtoonId: number) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number

  const w = await Webtoon.findByPk(webtoonId, {
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
    raw: true,
    nest: true,
  })

  if (!w) {
    return NextResponse.json({ error: '웹툰을 찾을 수 없습니다.' }, { status: 404 })
  }

  const sub = await Subscription.findOne({
    where: { memberId, webtoonId, status: 'ACTIVE' },
    attributes: ['alarm_on'],
    raw: true,
  })

  const detail: WebtoonDetailDTO = {
    id: w.idx,
    name: w.webtoonName,
    description: w.discription,
    genre: w.genre,
    thumbnailUrl: w.thumbnailUrl,
    views: w.views,
    recommend: w.recommend,
    artistName: w.Artist.artistName,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    subscription: {
      isSubscribed: !!sub,
      alarmOn: sub?.alarm_on ?? false,
    },
  }

  return NextResponse.json(detail)
}

