import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import { replyToComment } from '@/controllers/comment'

export async function POST(
  req: NextRequest,
  { params }: { params: { parentCommentId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const parentCommentId = parseInt(params.parentCommentId, 10)
  const { content } = (await req.json()) as { content?: string }

  if (!content) {
    return NextResponse.json(
      { error: '답글 내용을 입력해주세요.' },
      { status: 400 }
    )
  }

  try {
    // parentCommentId 포함해 답글 생성
    const reply = await replyToComment(userId, parentCommentId, content)
    return NextResponse.json(reply, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '답글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
