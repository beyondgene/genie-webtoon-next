import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { Webtoon, Artist } from '@/models/webtoon'
import { Subscription } from '@/models/subscription'

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1) 로그인 검사
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number
  const webtoonId = parseInt(params.id, 10)

  // 2) 웹툰 상세 조회
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

  // 3) 구독 상태 조회
  const sub = await Subscription.findOne({
    where: { memberId, webtoonId, status: 'ACTIVE' },
    attributes: ['alarm_on'],
    raw: true,
  })

  // 4) DTO 변환 후 반환
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
