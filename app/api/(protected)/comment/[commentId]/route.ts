import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import {
  getCommentById,
  deleteComment,
  updateComment,
} from '@/controllers/comment'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const { id: userId, isAdmin } = sessionOrRes as any
  const commentId = parseInt(params.commentId, 10)

  try {
    const comment = await getCommentById(commentId)
    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    if (comment.memberId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }
    await deleteComment(commentId)
    return NextResponse.json({ message: '댓글이 삭제되었습니다.' })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const { id: userId, isAdmin } = sessionOrRes as any
  const commentId = parseInt(params.commentId, 10)
  const { content } = (await req.json()) as { content?: string }

  if (!content) {
    return NextResponse.json(
      { error: '수정할 댓글 내용을 입력해주세요.' },
      { status: 400 }
    )
  }

  try {
    const comment = await getCommentById(commentId)
    if (!comment) {
      return NextResponse.json(
        { error: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    if (comment.memberId !== userId && !isAdmin) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다.' },
        { status: 403 }
      )
    }
    const updated = await updateComment(commentId, content)
    // updateComment() 는 { id, content, modifiedDate, ... } 형태로 반환
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
