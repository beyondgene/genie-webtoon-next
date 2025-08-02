// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      /** DB PK (idx) */
      id: number | string;
      /** ACTIVE | DELETED 같은 상태값 */
      role: string;
      /** 우리 DB의 memberId */
      memberId: string;
      /** 닉네임 */
      nickname: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    /** DB PK (idx) */
    id: number | string;
    /** ACTIVE | DELETED 같은 상태값 */
    status: string;
    /** 우리 DB의 memberId */
    memberId: string;    // ← 반드시 추가
    /** 닉네임 */
    nickname: string;    // ← 반드시 추가
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    /** DB PK (idx) */
    id: number | string;
    /** ACTIVE | DELETED 같은 상태값 */
    role: string;
    /** 우리 DB의 memberId */
    memberId: string;
    /** 닉네임 */
    nickname: string;
  }
}
