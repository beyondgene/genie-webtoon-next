// lib/middlewares/auth.ts
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';

type Role = 'MEMBER' | 'ADMIN';

/** 라이트 세션 타입(서버 API에서 자주 쓰는 핵심 필드만) */
export interface AuthSessionLite {
  id: number; // DB PK (idx)
  role: Role; // 'MEMBER' | 'ADMIN'
  memberId: string; // 로그인용 아이디
  nickname: string; // 닉네임
}

/** (별칭) 과거 코드 호환 */
export type AuthSession = AuthSessionLite;

/** 공통 JSON 에러 응답 */
function jsonError(status: number, message: string, code?: string, details?: unknown) {
  return NextResponse.json({ code, message, details }, { status });
}

/** 내부: NextAuth Session → 라이트 세션 변환 */
function toLite(session: Session | null): AuthSessionLite | null {
  if (!session?.user) return null;

  // id는 user.id 또는 세션 루트(id)에서 가져오고, string 숫자면 number로 변환
  const rawId = (session.user as any).id ?? (session as any).id ?? null;
  if (rawId == null) return null;
  const id = typeof rawId === 'string' && /^\d+$/.test(rawId) ? Number(rawId) : (rawId as number);

  const role = ((session.user as any).role ?? (session as any).role) as Role | undefined;
  const memberId = (session.user as any).memberId ?? (session as any).memberId;
  const nickname = (session.user as any).nickname ?? (session as any).nickname;

  if (!id || !role || !memberId || !nickname) return null;

  return { id, role, memberId, nickname };
}

/** (옵션) 가드 없이 세션 읽기 — 서버 로직에서 편의용 */
export async function getSessionLite(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return toLite(session);
}

/** API 가드: 로그인 필수 — 성공 시 라이트 세션 반환, 실패 시 JSON 401 */
export type RequireAuthResult = AuthSessionLite | NextResponse;

export async function requireAuth(_req: NextRequest): Promise<RequireAuthResult> {
  const session = await getServerSession(authOptions);
  const lite = toLite(session);
  if (!lite) {
    return jsonError(401, '로그인이 필요합니다.', 'UNAUTHORIZED');
  }
  return lite;
}

/** API 가드: 관리자 권한 필수 — 실패 시 JSON 403 */
export async function requireAdminAuth(_req: NextRequest): Promise<RequireAuthResult> {
  const authed = await requireAuth(_req);
  if (authed instanceof NextResponse) return authed;
  if (authed.role !== 'ADMIN') {
    return jsonError(403, '관리자 권한이 필요합니다.', 'FORBIDDEN');
  }
  return authed;
}

/** (호환 별칭) */
export const requireAdmin = requireAdminAuth;
