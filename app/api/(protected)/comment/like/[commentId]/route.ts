import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import {
  likeComment,
  unlikeComment,
} from '@/controllers/comment'

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const commentId = parseInt(params.commentId, 10)

  try {
    await likeComment(userId, commentId)    // COMMENT_LIKE 테이블에 삽입
    return NextResponse.json(
      { message: '댓글에 좋아요를 눌렀습니다.' },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const commentId = parseInt(params.commentId, 10)

  try {
    await unlikeComment(userId, commentId)  // COMMENT_LIKE 테이블에서 삭제
    return NextResponse.json({ message: '댓글 좋아요를 취소했습니다.' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '좋아요 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
