import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, requireAdminAuth } from '@/lib/middlewares/auth'
import { logAdView, getAdViewLogs } from '@/controllers/adViewLog'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1) 로그인된 회원만 접근
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes

  const memberId = sessionOrRes.id as number
  const adId = parseInt(params.id, 10)

  try {
    const entry = await logAdView(memberId, adId)
    return NextResponse.json(
      { success: true, idx: entry.idx, viewed_at: entry.viewed_at },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 2) 관리자만 조회 가능
  const adminOrRes = await requireAdminAuth(req)
  if (adminOrRes instanceof NextResponse) return adminOrRes

  const adId = parseInt(params.id, 10)

  try {
    const logs = await getAdViewLogs(adId)
    return NextResponse.json(logs)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
