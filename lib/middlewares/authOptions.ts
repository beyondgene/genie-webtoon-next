import NextAuth, { NextAuthOptions } from 'next-auth';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({ clientId: process.env.KAKAO_ID!, clientSecret: process.env.KAKAO_SECRET! }),
    NaverProvider({ clientId: process.env.NAVER_ID!, clientSecret: process.env.NAVER_SECRET! }),
    // … other providers
  ],
  callbacks: {
    async session({ session, token, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
    // … 기타 콜백
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
