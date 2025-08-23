// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as NextAuthJWT } from 'next-auth/jwt';

/** 앱 전역에서 쓰는 롤 타입 (멤버/관리자 구분) */
export type UserRole = 'MEMBER' | 'ADMIN';

/** 관리자 테이블 전용 세부 롤(관리자 내부 권한) */
export type AdminRole = 'SUPER' | 'MANAGER';

declare module 'next-auth' {
  /**
   * 세션에 우리가 쓰는 식별자와 롤을 ‘최상위’와 ‘user’ 둘 다에 확장합니다.
   * - 라우터 헬퍼(requireAuth)에서 session.id로 접근하는 기존 코드도 그대로 동작
   * - 클라이언트 컴포넌트에서는 session.user.id 등으로 접근
   */
  interface Session extends DefaultSession {
    /** DB PK (idx) — 서버 로직에서 주로 사용 */
    id: number;
    /** 앱 구분용 롤 ("MEMBER" | "ADMIN") */
    role: UserRole;
    /** 우리 DB의 로그인용 아이디(문자열) */
    memberId: string;
    /** 닉네임 */
    nickname: string;

    user: {
      /** 동일 정보 클라이언트 편의상 user 안에도 복제 */
      id: number;
      role: UserRole;
      memberId: string;
      nickname: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    /** DB PK (idx) */
    id: number;
    /** 앱 구분용 롤 */
    role: UserRole;
    /** 회원 상태 — Member 모델 기준 */
    status?: 'PENDING' | 'ACTIVE' | 'DELETED' | 'SUSPENDED';
    /** 로그인용 아이디 */
    memberId: string;
    /** 닉네임 */
    nickname: string;
    /** (선택) 관리자라면 내부 권한 */
    adminRole?: AdminRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    /** DB PK (idx) — JWT에는 string으로 들어올 수도 있어 union 유지 */
    id: number | string;
    role: UserRole;
    memberId: string;
    nickname: string;
    /** (선택) 관리자 세부 롤 */
    adminRole?: AdminRole;
  }
}

// 이 파일을 모듈로 인식시키기 위한 빈 export
export {};
