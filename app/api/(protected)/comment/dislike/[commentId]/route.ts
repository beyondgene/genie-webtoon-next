import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import {
  dislikeComment,
  undislikeComment,
} from '@/controllers/comment'

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = (sessionOrRes as any).id as number
  const commentId = parseInt(params.commentId, 10)

  try {
    await dislikeComment(userId, commentId)
    return NextResponse.json(
      { message: '댓글에 싫어요를 눌렀습니다.' },
      { status: 201 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '싫어요 처리 중 오류가 발생했습니다.' },
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
  const userId = (sessionOrRes as any).id as number
  const commentId = parseInt(params.commentId, 10)

  try {
    await undislikeComment(userId, commentId)
    return NextResponse.json({ message: '댓글 싫어요를 취소했습니다.' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '싫어요 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
