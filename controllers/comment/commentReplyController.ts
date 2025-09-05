// controllers/comment/commentReplyController.ts
import db from '@/models';

const DEFAULT_COMMENT_ADMIN_ID = Number(process.env.DEFAULT_COMMENT_ADMIN_ID ?? 2);

// 기존 인코딩 규칙을 유지(부모 댓글 번호를 본문에 각인 + 테이블에 부모댓글ID 속성을 생성하지 않고 작성시 답글을 누른 댓글의 IDX를 임시 저장)
export function encodeReplyContent(parentId: number, text: string) {
  return `::p[${parentId}] ${text}`;
}
// 부모댓글에 대한 답글을 작성시 필요한 속성과 작성시 채워지는 필드 명시
export async function createReply(opts: {
  parentCommentId: number;
  webtoonId: number;
  episodeId: number;
  memberId: number;
  text: string;
}) {
  const { parentCommentId, webtoonId, episodeId, memberId, text } = opts;

  const Comment: any = (db as any).Comment;

  const created = await Comment.create({
    likes: 0,
    dislikes: 0,
    commentCol: encodeReplyContent(parentCommentId, String(text ?? '')),
    memberId,
    adminId: DEFAULT_COMMENT_ADMIN_ID, // 요청사항: 항상 2
    webtoonId,
    episodeId,
    creationDate: new Date(),
    modifiedDate: new Date(),
  });

  return { id: created?.idx ?? null };
}
