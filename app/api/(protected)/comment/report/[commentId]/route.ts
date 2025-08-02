import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { reportComment } from '@/controllers/comment'

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const commentId = parseInt(params.commentId, 10)
  const { reason } = (await req.json()) as { reason?: string }

  if (!reason) {
    return NextResponse.json(
      { error: '신고 사유를 입력해주세요.' },
      { status: 400 }
    )
  }

  try {
    // ERD 기반 COMMENT_REPORT(or controllers 로직) 에 저장
    await reportComment(userId, commentId, reason)
    return NextResponse.json({ message: '댓글이 신고되었습니다.' }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 신고 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
