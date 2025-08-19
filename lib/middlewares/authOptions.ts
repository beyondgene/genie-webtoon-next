// lib/middlewares/authOptions.ts
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';
import EmailProvider from 'next-auth/providers/email';
import SequelizeAdapter from '@next-auth/sequelize-adapter';
import bcrypt from 'bcrypt';
import db from '@/models';

/**
 * NextAuth의 유일한 설정 소스.
 * - 어댑터: SequelizeAdapter(db.sequelize)
 * - 프로바이더: Credentials / Kakao / Naver / Email
 * - 콜백: jwt, session (types/next-auth.d.ts 확장 필드 반영)
 * - 페이지: 커스텀 로그인
 */
export const authOptions: NextAuthOptions = {
  adapter: SequelizeAdapter(db.sequelize),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        memberId: { label: 'Member ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        const suppliedPassword =
          (credentials as any)?.password ?? (credentials as any)?.memberPassword;
        if (!credentials?.memberId || !suppliedPassword) {
          throw new Error('아이디와 비밀번호를 모두 입력해주세요.');
        }

        const user = await db.Member.findOne({
          where: { memberId: credentials.memberId },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(suppliedPassword, user.memberPassword);
        if (!isValid) throw new Error('비밀번호가 일치하지 않습니다.');

        // 반드시 `id` 필드 제공 (우리 DB PK: idx)
        return {
          id: user.idx, // ← number | string 허용(우리 타입 확장과 일치)
          status: user.status, // 커스텀 필드 (JWT로 전달)
          memberId: user.memberId, // 커스텀 필드
          nickname: user.nickname, // 커스텀 필드
          name: user.nickname, // DefaultUser.name
          email: user.email, // DefaultUser.email
        } as unknown as User;
      },
    }),

    KakaoProvider({
      clientId: process.env.KAKAO_ID!,
      clientSecret: process.env.KAKAO_SECRET!,
    }),

    NaverProvider({
      clientId: process.env.NAVER_ID!,
      clientSecret: process.env.NAVER_SECRET!,
    }),

    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      // 로그인 시 1회 유저 정보 → 토큰에 탑재
      if (user) {
        token.id = (user as any).id;
        token.status = (user as any).status;
        token.memberId = (user as any).memberId;
        token.nickname = (user as any).nickname;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션으로 매핑 (types/next-auth.d.ts 확장과 일치)
      if (session.user) {
        (session.user as any).id = token.id as number;
        (session.user as any).status = token.status;
        (session.user as any).memberId = token.memberId;
        (session.user as any).nickname = token.nickname;
      }
      return session;
    },
  },

  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
