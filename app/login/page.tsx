// app/login/page.tsx
'use client';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 기존 사용 이미지 유지
import NaverBtn from '@/public/auth/naver_login.png';
import KakaoBtn from '@/public/auth/kakao_login.png';

// (선택) 페이지 전용 폰트: 피그마가 Montserrat라면 같이 로드
import { Montserrat } from 'next/font/google';
const mont = Montserrat({
  subsets: ['latin'],
  weight: ['300', '500', '600'],
  variable: '--font-mont',
});

// ====== 기존 검증 로직 유지 ======
const schema = z.object({
  id: z
    .string()
    .min(1, 'ID를 입력하세요.')
    .regex(/^[A-Za-z0-9_]+$/, 'ID는 영문/숫자/밑줄만 허용됩니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '영문을 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.')
    .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다.'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    // credentials 로그인 후 post-login으로 이동
    const res = await signIn('credentials', {
      memberId: data.id,
      password: data.password,
      redirect: false,
    });
    setSubmitting(false);

    if (res?.ok) {
      router.replace('/post-login');
    } else {
      reset({ id: '', password: '' });
      alert('로그인 실패: ID/PW를 확인하세요.');
    }
  };

  return (
    <div
      className={`${mont.variable} min-h-screen w-full flex items-start sm:items-center justify-center`}
      style={{
        background: '#4f4f4f' /* #929292 */,
        fontFamily: 'var(--font-mont), system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      {/* 가운데 컬럼 (피그마 기준 고정폭 요소들) */}
      <div className="w-[309px] sm:w-[309px] px-2 py-16 sm:py-0">
        {/* 로고 영역: 실제 이미지를 쓰실 거면 src 교체하세요, bg rgba(0,0,0,0.7) */}
        <div className="mx-auto mb-8 grid h-[186px] w-[309px] place-content-center rounded-[4px] bg-[#696969]">
          {/* 예비 텍스트 (이미지 없을 때) */}
          <span className="text-[22px] font-semibold tracking-wide text-white/90">
            GENIE WEBTOON
          </span>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[14px]">
          {/* ID */}
          <div className="relative">
            <input
              type="text"
              autoComplete="username"
              placeholder="ID" // placeholder를 대문자로
              className="w-[300px] h-[45px] rounded-[4px] bg-transparent text-white placeholder-white/80 px-[14px] outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('id')}
            />
            {errors.id && <p className="mt-1 text-xs text-white/90">{errors.id.message}</p>}
          </div>

          {/* PW */}
          <div className="relative">
            <input
              type="password"
              autoComplete="current-password"
              placeholder="PW"
              className="w-[300px] h-[45px] rounded-[4px] bg-transparent text-white placeholder-white/80 px-[14px] outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-white/90">{errors.password.message}</p>
            )}
          </div>

          {/* LOGIN 버튼: 흰 배경 + 파란 텍스트 + drop shadow */}
          <button
            type="submit"
            disabled={submitting}
            className="w-[300px] h-[45px] rounded-[4px] uppercase font-semibold text-[16px] shadow-md disabled:opacity-60"
            style={{
              background: 'white',
              color: '#2148C0',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.30)',
            }}
          >
            {submitting ? '로그인 중…' : 'LOGIN'}
          </button>
        </form>

        {/* 링크 3개 */}
        <div className="mt-3 flex w-[300px] justify-between text-white">
          <a href="/signup" className="text-[16px] font-medium hover:opacity-90">
            회원가입
          </a>
          <a href="/find-id" className="text-[16px] font-medium hover:opacity-90">
            아이디 찾기
          </a>
          <a href="/find-password" className="text-[16px] font-medium hover:opacity-90">
            비밀번호 찾기
          </a>
        </div>

        {/* 소셜 로그인 - callbackUrl을 post-login으로 변경 */}
        <div className="mt-6 flex w-[300px] items-center justify-center gap-4">
          <button
            onClick={() => signIn('kakao', { callbackUrl: '/post-login' })}
            aria-label="카카오로 로그인"
            className="inline-flex"
          >
            <Image src={KakaoBtn} alt="카카오 로그인" width={44} height={44} priority />
          </button>
        </div>
      </div>
    </div>
  );
}
