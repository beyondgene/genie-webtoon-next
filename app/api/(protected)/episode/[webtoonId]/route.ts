import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { getEpisodesByWebtoon } from '@/controllers/episode'
import { getSubscriptionStatus } from '@/controllers/subscription'

export async function GET(
  req: NextRequest,
  { params }: { params: { webtoonId: string } }
) {
  // 1) 로그인 검사
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number

  const webtoonId = parseInt(params.webtoonId, 10)
  try {
    // 2) 에피소드 목록 조회 (idx, title, thumbnailUrl, uploadDate 등)
    const episodes = await getEpisodesByWebtoon(webtoonId)

    // 3) 구독 상태 & 알림 on/off 조회
    const { isSubscribed, alarmOn } = await getSubscriptionStatus(userId, webtoonId)

    return NextResponse.json({
      episodes,
      subscription: { isSubscribed, alarmOn },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '에피소드 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
