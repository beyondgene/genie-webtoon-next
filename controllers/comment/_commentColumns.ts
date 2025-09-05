// controllers/comment/_commentColumns.ts
// comment 테이블 관련 속성들을 기본으로 기본 column 속성 정의
export async function buildCommentAttributes(): Promise<string[]> {
  return [
    'idx',
    'likes',
    'dislikes',
    'commentCol', // 구 본문
    'creationDate',
    'modifiedDate',
    'memberId',
    'webtoonId',
    'episodeId',
    'adminId',
  ];
}
