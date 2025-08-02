// controllers/auth/nextAuthController.ts
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KakaoProvider from 'next-auth/providers/kakao';
import NaverProvider from 'next-auth/providers/naver';
import EmailProvider from 'next-auth/providers/email';
import SequelizeAdapter from '@next-auth/sequelize-adapter';
import bcrypt from 'bcrypt';
import db from '@/models';

export const authOptions: NextAuthOptions = {
  adapter: SequelizeAdapter(db.sequelize),

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        memberId: { label: 'Member ID', type: 'text' },
        password:   { label: 'Password',  type: 'password' },
      },
      // 반환 타입을 명시해 줍니다
      async authorize(
        credentials,
        req
      ): Promise<User | null> {
        if (!credentials?.memberId || !credentials.password) {
          throw new Error('아이디와 비밀번호를 모두 입력해주세요.');
        }
        const user = await db.Member.findOne({
          where: { memberId: credentials.memberId },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.memberPassword
        );
        if (!isValid) throw new Error('비밀번호가 일치하지 않습니다.');

        // ★ 여기서 반드시 `id` 필드를 리턴하도록!
        return {
          id:        user.idx,        // ← `idx`가 아니라 `id`
          status:    user.status,
          memberId:  user.memberId,
          nickname:  user.nickname,
          name:      user.nickname,   // DefaultUser.name
          email:     user.email,      // DefaultUser.email
        };
      },
    }),

    KakaoProvider({
      clientId:     process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),

    NaverProvider({
      clientId:     process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),

    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from:   process.env.EMAIL_FROM!,
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id;
        token.status    = (user as any).status;
        token.memberId  = (user as any).memberId;
        token.nickname  = (user as any).nickname;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id       = token.id as number;
      (session.user as any).status    = token.status;
      (session.user as any).memberId  = token.memberId;
      (session.user as any).nickname  = token.nickname;
      return session;
    },
  },

  pages: { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
