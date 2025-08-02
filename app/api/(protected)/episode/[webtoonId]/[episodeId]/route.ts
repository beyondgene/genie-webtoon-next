import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { getEpisodeDetail } from '@/controllers/episode'
import { getSubscriptionStatus } from '@/controllers/subscription'
import { getAdById } from '@/controllers/advertisement'

export async function GET(
  req: NextRequest,
  { params }: { params: { webtoonId: string; episodeId: string } }
) {
  // 1) 로그인 검사
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number

  const webtoonId = parseInt(params.webtoonId, 10)
  const episodeId = parseInt(params.episodeId, 10)

  try {
    // 2) 상세 조회 (본문 이미지 리턴 포함)
    const episode = await getEpisodeDetail(webtoonId, episodeId)
    if (!episode) {
      return NextResponse.json({ error: '에피소드를 찾을 수 없습니다.' }, { status: 404 })
    }

    // 3) 구독 상태 & 알림 on/off
    const { isSubscribed, alarmOn } = await getSubscriptionStatus(userId, webtoonId)

    // 4) 에피소드 하단 광고 가져오기 (ERD: EPISODE.adId → ADVERTISEMENT)
    let advertisement = null
    if (episode.adId) {
      advertisement = await getAdById(episode.adId)
    }

    return NextResponse.json({
      episode,
      subscription: { isSubscribed, alarmOn },
      advertisement,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '에피소드 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
