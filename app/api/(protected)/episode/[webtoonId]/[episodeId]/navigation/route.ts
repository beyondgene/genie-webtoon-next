import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { getEpisodeNavigation } from '@/controllers/episode'

export async function GET(
  req: NextRequest,
  { params }: { params: { webtoonId: string; episodeId: string } }
) {
  // 1) 로그인 검사
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  const webtoonId = parseInt(params.webtoonId, 10)
  const episodeId = parseInt(params.episodeId, 10)

  try {
    // 2) navigation 컨트롤러: prev, next, totalCount 포함 반환
    //    e.g. { prev: { idx, title }, next: { idx, title }, totalCount: number }
    const nav = await getEpisodeNavigation(webtoonId, episodeId)
    return NextResponse.json(nav)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '내비게이션 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
