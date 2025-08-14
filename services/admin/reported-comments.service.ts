// 신고 댓글이 별도시 작성
// services/admin/reported-comments.service.ts
import { API_BASE } from './_http';

export interface ReportedComment {
  idx: number;
  createdAt: string;
  // Sequelize include 결과: 모델명(또는 alias)로 중첩됨
  Comment?: {
    idx: number;
    content?: string;
    Member?: { idx: number; nickname: string };
    Webtoon?: { idx: number; webtoonName: string };
    Episode?: { idx: number; uploadDate: string };
  };
  Reporter?: { idx: number; nickname: string }; // alias: Reporter
  // 기타 필드는 상황에 따라 확장 가능
}

/** 목록 조회 */
export async function listReportedComments(): Promise<ReportedComment[]> {
  const res = await fetch(`${API_BASE}/api/(protected)/admin/comments/reported`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`GET /admin/comments/reported failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/**
 * 신고 내역 삭제
 * 주의: 현재 API 폴더 구조가 /reported/[id]/route.ts 가 아니라 /reported/route.ts 이므로,
 *       서버 핸들러에서 querystring ?id= 를 읽도록 되어 있어야 합니다.
 *       (프로젝트의 route.ts가 params를 쓰고 있다면 버그이니 서버 쪽도 함께 정리 필요)
 */
export async function deleteReportedComment(id: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/(protected)/admin/comments/reported?id=${encodeURIComponent(id)}`,
    { method: 'DELETE' }
  );
  if (!res.ok && res.status !== 204) {
    throw new Error(`DELETE reported comment failed: ${res.status} ${await res.text()}`);
  }
}
