import NextAuth from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';

// 미들웨어에 정의된 authOption.ts를 호출하는 라우터
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
