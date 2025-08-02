import { NextRequest, NextResponse } from 'next/server'
import db from '@/models'
import { requireAuth } from '@/lib/middlewares/auth'

interface SubscriptionDTO {
  webtoonId: number
  webtoonName: string
  thumbnailUrl: string
  alarmOn: boolean
  status: 'ACTIVE' | 'INACTIVE'
  subscribedAt: string   // createdAt
  updatedAt: string
}

export async function GET(req: NextRequest) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const memberId = sessionOrRes.id as number

  try {
    // status = 'ACTIVE'만 조회
    const subs = await db.SUBSCRIPTION.findAll({
      where: { memberId, status: 'ACTIVE' },
      attributes: ['webtoonId', 'alarm_on', 'status', 'createdAt', 'updatedAt'],
      include: [{
        model: db.WEBTOON,
        attributes: ['idx', 'webtoonName', 'thumbnailUrl'],
      }],
      order: [['createdAt', 'DESC']],
    })

    const result: SubscriptionDTO[] = subs.map((s) => ({
      webtoonId: s.webtoonId,
      webtoonName: (s as any).WEBTOON.webtoonName,
      thumbnailUrl: (s as any).WEBTOON.thumbnailUrl,
      alarmOn: s.alarm_on,
      status: s.status,
      subscribedAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }))

    return NextResponse.json({ subscriptions: result })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '구독 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
