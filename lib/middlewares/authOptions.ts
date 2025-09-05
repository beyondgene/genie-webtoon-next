// lib/middlewares/authOptions.ts
import type { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import KakaoProvider from 'next-auth/providers/kakao';
import EmailProvider from 'next-auth/providers/email';
import SequelizeAdapter from '@next-auth/sequelize-adapter';
import bcrypt from 'bcrypt';
import db from '@/models';

export const authOptions: NextAuthOptions = {
  adapter: SequelizeAdapter(db.sequelize),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,

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

        // 1) 관리자 계정 우선 체크
        const admin = await db.Admin.findOne({
          where: { adminId: credentials.memberId },
        });
        if (admin) {
          const ok = await bcrypt.compare(suppliedPassword, admin.adminPassword);
          if (!ok) throw new Error('비밀번호가 일치하지 않습니다.');

          // 관리자 자격으로 로그인
          return {
            id: admin.idx,
            role: 'ADMIN',
            adminRole: admin.role, // 'SUPER' | 'MANAGER'
            memberId: admin.adminId,
            nickname: `관리자:${admin.adminId}`,
            name: `관리자:${admin.adminId}`,
            userType: 'ADMIN', // ← 토큰에서 분기할 힌트
          } as unknown as User;
        }

        // 2) 일반 회원
        const user = await db.Member.findOne({
          where: { memberId: credentials.memberId },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(suppliedPassword, user.memberPassword);
        if (!ok) throw new Error('비밀번호가 일치하지 않습니다.');

        // 상태 차단 (PENDING 포함)
        if (user.status !== 'ACTIVE') {
          if (user.status === 'PENDING') throw new Error('이메일 인증이 필요합니다.');
          if (user.status === 'DELETED') throw new Error('삭제된 계정입니다.');
          if (user.status === 'SUSPENDED') throw new Error('정지된 계정입니다.');
        }

        return {
          id: user.idx,
          status: user.status,
          memberId: user.memberId,
          nickname: user.nickname,
          name: user.nickname,
          role: 'MEMBER',
          userType: 'CREDENTIALS',
        } as unknown as User;
      },
    }),

    // 소셜 - 교차 연동 방지 설정 강화
    KakaoProvider({
      clientId: process.env.KAKAO_ID!,
      clientSecret: process.env.KAKAO_SECRET!,
      // 이메일 같아도 자동 링크 완전 금지
      allowDangerousEmailAccountLinking: false,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),
  ],

  callbacks: {
    /**
     * 로그인 허용 여부 - 소셜 로그인 교차 연동 방지 강화
     */
    async signIn({ user, account, profile }) {
      // OAuth(카카오/네이버)만 처리
      if (account?.type === 'oauth' && account.provider !== 'credentials') {
        const { models } = db.sequelize as any;
        const Account = models?.Account ?? models?.accounts ?? models?.account;
        const User = models?.User ?? models?.users ?? models?.user;

        // 현재 로그인 시도하는 provider와 providerAccountId
        const currentProvider = account.provider;
        const currentProviderAccountId = account.providerAccountId;

        // 1) 이미 같은 provider로 등록된 계정인지 확인
        if (Account && currentProviderAccountId) {
          const existingAccount = await Account.findOne({
            where: {
              provider: currentProvider,
              providerAccountId: currentProviderAccountId,
            },
            attributes: ['userId', 'provider'],
          });

          // 이미 등록된 소셜 계정이면 정상 로그인 허용
          if (existingAccount) {
            return true;
          }
        }

        // 2) 이메일 기반 교차 연동 방지 체크
        const email = (user as any)?.email ?? (profile as any)?.email ?? null;

        if (email && Account) {
          // 해당 이메일로 이미 다른 소셜 provider가 연결되어 있는지 확인
          const userByEmail = await User?.findOne({
            where: { email },
            attributes: ['id'],
          });

          if (userByEmail) {
            const existingAccounts = await Account.findAll({
              where: { userId: userByEmail.id },
              attributes: ['provider'],
            });

            const existingProviders = existingAccounts.map((acc: any) => acc.provider);

            // 현재 provider가 아닌 다른 소셜 provider가 이미 연결되어 있으면 차단
            const hasOtherSocialProvider = existingProviders.some(
              (p: string) => p !== currentProvider && ['kakao', 'naver'].includes(p)
            );

            if (hasOtherSocialProvider) {
              // 이미 다른 소셜 로그인이 연결된 이메일입니다.
              throw new Error('이미 다른 소셜 로그인 방식으로 가입된 이메일입니다.');
            }
          }
        }

        // 3) 우리 Member 테이블의 상태 체크
        if (email) {
          const existing = await db.Member.findOne({
            where: { email },
            attributes: ['status', 'socialProvider'],
          });

          if (existing) {
            const sp = existing.socialProvider as string | null;
            // 3-1) 이미 다른 소셜 provider로 가입된 경우: 현재 provider로 로그인 금지
            if (sp && sp !== currentProvider) {
              throw new Error(
                `이미 ${sp.toUpperCase()}로 가입된 계정입니다. ${sp.toUpperCase()}로 로그인하세요.`
              );
            }
            // 3-2) (핵심) 기존 회원인데 소셜 미연동(null) 상태면, 소셜 최초 로그인으로 자동 연결 금지
            //      => 반드시 '아이디/비밀번호'로 로그인 후 '계정 연결' 플로우에서만 연결 허용
            if (!sp) {
              throw new Error(
                '소셜 미연동 계정입니다. 먼저 아이디/비밀번호로 로그인 후 [계정 연결]을 진행하세요.'
              );
            }

            // 상태 체크
            if (existing.status === 'PENDING') throw new Error('이메일 인증이 필요합니다.');
            if (existing.status === 'DELETED') throw new Error('삭제된 계정입니다.');
            if (existing.status === 'SUSPENDED') throw new Error('정지된 계정입니다.');
          }
        }
      }

      // credentials는 여기서 통과
      return true;
    },

    /**
     * 안전한 redirect: 이상한 URL은 /post-login 으로 귀결
     */
    async redirect({ url, baseUrl }) {
      const normalize = (u?: string | null) => {
        if (!u) return '/post-login';
        if (!/^https?:\/\//i.test(u) && !u.startsWith('/')) u = `/${u}`;
        if (u === '/' || u === '/home' || u === '/login') u = '/post-login';
        return u;
      };
      const u = normalize(url);
      if (u.startsWith('/')) return `${baseUrl}${u}`;
      try {
        const dest = new URL(u);
        return dest.origin === baseUrl ? dest.toString() : `${baseUrl}/post-login`;
      } catch {
        return `${baseUrl}/post-login`;
      }
    },

    /**
     * JWT 가공 - 소셜 provider 정보 추가
     */
    async jwt({ token, user, account, profile }) {
      // 1) 로그인 시점의 기본 매핑(기존 유지)
      if (user) {
        const idMaybe =
          (user as any).id ??
          (typeof token.sub === 'string' && /^\d+$/.test(token.sub)
            ? Number(token.sub)
            : undefined);
        if (idMaybe != null) token.id = idMaybe as number;
        token.status = (user as any).status ?? token.status;
        token.memberId = (user as any).memberId ?? token.memberId;
        token.nickname = (user as any).nickname ?? token.nickname;
        (token as any).role = (user as any).role ?? (token as any).role ?? 'MEMBER';
        if ((user as any).adminRole) (token as any).adminRole = (user as any).adminRole;
        if ((user as any).userType) (token as any).userType = (user as any).userType;
      }

      // 2) OAuth 로그인일 때: providerAccountId로 확정 매핑 + 소셜 provider 정보 저장
      if (account && account.provider !== 'credentials') {
        const provider = account.provider; // 'kakao' | 'naver' | ...
        const providerAccountId =
          (account as any).providerAccountId ?? (profile as any)?.id?.toString?.() ?? null;

        try {
          const { models } = db.sequelize;
          const AccountModel: any =
            (models as any)?.Account ?? (models as any)?.accounts ?? (models as any)?.account;
          const UserModel: any =
            (models as any)?.User ?? (models as any)?.users ?? (models as any)?.user;

          if (providerAccountId && AccountModel && UserModel) {
            const acc = await AccountModel.findOne({
              where: { provider, providerAccountId },
              attributes: ['userId', 'provider', 'providerAccountId'],
            });

            if (acc) {
              const adapterUser = await UserModel.findByPk(acc.userId, {
                attributes: ['id', 'email', 'name'],
              });

              const emailFromAdapter = adapterUser?.email ?? null;
              (token as any).oauthUserId = adapterUser?.id ?? acc.userId;

              // 우리 Member와 최종 매핑
              if (emailFromAdapter) {
                const m = await db.Member.findOne({ where: { email: emailFromAdapter } });
                if (m) {
                  token.id = m.idx;
                  token.status = m.status;
                  token.memberId = m.memberId;
                  token.nickname = m.nickname ?? token.nickname;
                  (token as any).role = 'MEMBER';
                  (token as any).onboarding = false;
                  (token as any).oauthProvider = provider;
                  (token as any).socialProvider = provider; // 추가: 소셜 provider 정보

                  return token;
                }
              }

              // Member가 없으면 온보딩 필요
              (token as any).onboarding = true;
              (token as any).oauthProvider = provider;
              (token as any).socialProvider = provider; // 추가
              (token as any).email = emailFromAdapter ?? (token as any).email;
              return token;
            }
          }

          // Fallback 처리
          const email =
            (user as any)?.email ?? (token as any)?.email ?? (profile as any)?.email ?? null;

          if (email) {
            const m = await db.Member.findOne({ where: { email } });
            if (m) {
              token.id = m.idx;
              token.status = m.status;
              token.memberId = m.memberId;
              token.nickname = m.nickname ?? token.nickname;
              (token as any).role = 'MEMBER';
              (token as any).onboarding = false;
              (token as any).oauthProvider = provider;
              (token as any).socialProvider = provider; // 추가
            } else {
              (token as any).onboarding = true;
              (token as any).oauthProvider = provider;
              (token as any).socialProvider = provider; // 추가
              (token as any).email = email;
              if ((user as any)?.name && !token.nickname) token.nickname = (user as any).name;
            }
          } else {
            (token as any).onboarding = true;
            (token as any).oauthProvider = provider;
            (token as any).socialProvider = provider; // 추가
          }
        } catch (e) {
          (token as any).onboarding = true;
          (token as any).oauthProvider = account.provider;
          (token as any).socialProvider = account.provider; // 추가
        }
      }

      // 3) 관리자 재확인(기존 유지)
      const roleNow = (token as any).role;
      const nuid =
        typeof token.id === 'number'
          ? token.id
          : typeof token.sub === 'string' && /^\d+$/.test(token.sub)
            ? Number(token.sub)
            : undefined;

      if (roleNow === 'ADMIN' && typeof nuid === 'number' && Number.isFinite(nuid)) {
        const admin = await db.Admin.findByPk(nuid, { attributes: ['idx', 'role', 'adminId'] });
        if (admin) {
          (token as any).adminRole = admin.role;
          if (!token.nickname) token.nickname = `관리자:${admin.adminId}`;
        } else {
          (token as any).role = 'MEMBER';
          delete (token as any).adminRole;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // 기존 그대로 + socialProvider 정보 추가
      if (session.user) {
        (session.user as any).id = token.id as number;
        (session.user as any).status = token.status;
        (session.user as any).memberId = token.memberId;
        (session.user as any).nickname = token.nickname;
        (session.user as any).role = (token as any).role ?? 'MEMBER';
        if ((token as any).adminRole) (session.user as any).adminRole = (token as any).adminRole;
        if ((token as any).userType) (session.user as any).userType = (token as any).userType;
        if (typeof (token as any).onboarding === 'boolean') {
          (session.user as any).onboarding = (token as any).onboarding;
        }
        if ((token as any).oauthProvider) {
          (session.user as any).oauthProvider = (token as any).oauthProvider;
        }
        if ((token as any).socialProvider) {
          (session.user as any).socialProvider = (token as any).socialProvider;
        }
        if ((token as any).email && !(session.user as any).email) {
          (session.user as any).email = (token as any).email;
        }
        if ((token as any).oauthUserId) {
          (session.user as any).oauthUserId = (token as any).oauthUserId;
        }
      }
      return session;
    },
  },
};
