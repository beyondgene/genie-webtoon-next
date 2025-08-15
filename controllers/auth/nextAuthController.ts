// controllers/auth/nextAuthController.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/middlewares/authOptions';

/**
 * 컨트롤러는 이제 설정을 소유하지 않습니다.
 * - 오직 핸들러(glue)만 생성/수출
 * - 라우터에서 가져다 쓰거나, 컨트롤러 인덱스에서 재수출 가능
 */
const nextAuthHandler = NextAuth(authOptions);
export default nextAuthHandler;
