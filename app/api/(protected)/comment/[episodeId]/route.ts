import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middlewares/auth'
import {
  getCommentsByEpisode,
  createComment,
} from '@/controllers/comment'

type CommentDTO = {
  id: number
  content: string
  memberId: number
  memberNickname: string
  likeCount: number
  isLiked: boolean
  creationDate: string
  modifiedDate: string
  replies: CommentDTO[]
}

export async function GET(
  req: NextRequest,
  { params }: { params: { episodeId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const episodeId = parseInt(params.episodeId, 10)

  try {
    const comments: CommentDTO[] = await getCommentsByEpisode(episodeId, userId)
    return NextResponse.json(comments)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { episodeId: string } }
) {
  const sessionOrRes = await requireAuth(req)
  if (sessionOrRes instanceof NextResponse) return sessionOrRes
  const userId = sessionOrRes.id as number
  const episodeId = parseInt(params.episodeId, 10)
  const { content } = (await req.json()) as { content?: string }

  if (!content) {
    return NextResponse.json(
      { error: '댓글 내용을 입력해주세요.' },
      { status: 400 }
    )
  }

  try {
    const newComment: CommentDTO = await createComment(
      userId,
      episodeId,
      content
    )
    return NextResponse.json(newComment, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || '댓글 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
