import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { getWebtoonsByGenre } from '@/controllers/genre'
import { getSubscriptionStatusForList } from '@/controllers/subscription'

interface LocalWebtoon {
  idx: number
  webtoonName: string
  thumbnailUrl: string
  discription: string
}

interface SubscriptionStatus {
  webtoonId: number
  alarm_on: boolean
}

export async function GET(
  req: NextRequest,
  { params }: { params: { genre: string } }
) {
  // 로그인 검사
  const authResult = await requireAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const userId = authResult.id as number
  const { genre } = params

  try {
    // 1) 장르별 웹툰 목록 조회
    const webtoons: LocalWebtoon[] = await getWebtoonsByGenre(genre)

    // 2) 해당 웹툰들에 대한 구독 상태 + 알림 설정 조회
    const webtoonIds = webtoons.map((w: LocalWebtoon) => w.idx)
    const subs: SubscriptionStatus[] = await getSubscriptionStatusForList(userId, webtoonIds)

    // 3) Map<webtoonId, alarm_on> 생성
    const subsMap: Map<number, boolean> = new Map(
      subs.map((s: SubscriptionStatus) => [s.webtoonId, s.alarm_on])
    )

    // 4) 응답 포맷으로 변환
    const result = webtoons.map((w: LocalWebtoon) => ({
      id: w.idx,
      name: w.webtoonName,
      thumbnailUrl: w.thumbnailUrl,
      description: w.discription,
      isSubscribed: subsMap.has(w.idx),
      alarmOn: subsMap.get(w.idx) ?? false,
    }))

    return NextResponse.json({ genre, webtoons: result }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? '장르별 웹툰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
