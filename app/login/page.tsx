// app/login/page.tsx
'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    // Credentials Provider를 'credentials'로 사용한다고 가정
    const res = await signIn('credentials', {
      username: data.id,
      password: data.password,
      redirect: false,
    });
    setSubmitting(false);

    if (res?.ok) {
      router.replace('/home');
    } else {
      // 스펙: 조건 불만족/실패 시 초기화
      reset({ id: '', password: '' });
      alert('로그인 실패: ID/PW를 확인하세요.');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-900 text-white">
      <div className="w-full max-w-[420px] rounded-2xl p-8 shadow-lg bg-neutral-800">
        <h1 className="text-2xl font-bold mb-6 text-center">Genie Webtoon 로그인</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">ID (영문/숫자/밑줄)</label>
            <input
              {...register('id')}
              type="text"
              autoComplete="username"
              className="w-full rounded-md p-3 bg-neutral-700 outline-none focus:ring-2"
              placeholder="your_id"
            />
            {errors.id && <p className="text-red-400 text-sm mt-1">{errors.id.message}</p>}
          </div>

          <div>
            <label className="block mb-2 text-sm">PW (8자 이상, 영문/숫자/특수문자)</label>
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md p-3 bg-neutral-700 outline-none focus:ring-2"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md p-3 font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50"
          >
            {submitting ? '로그인 중…' : 'LOGIN'}
          </button>
        </form>

        <div className="my-6 h-px bg-neutral-700" />

        <div className="space-y-3">
          {/* 네이버/카카오 로그인 버튼 (이미지 경로는 public에 배치) */}
          <button
            onClick={() => signIn('naver', { callbackUrl: '/home' })}
            className="w-full rounded-md overflow-hidden bg-white"
            aria-label="네이버로 로그인"
          >
            <Image
              src="/images/auth/naver-login.png"
              alt="네이버 로그인"
              width={384}
              height={48}
              priority
            />
          </button>

          <button
            onClick={() => signIn('kakao', { callbackUrl: '/home' })}
            className="w-full rounded-md overflow-hidden bg-white"
            aria-label="카카오로 로그인"
          >
            <Image
              src="/images/auth/kakao-login.png"
              alt="카카오 로그인"
              width={384}
              height={48}
              priority
            />
          </button>
        </div>

        <div className="mt-6 text-sm flex items-center justify-between text-neutral-300">
          <a href="/signup" className="hover:underline">
            회원가입
          </a>
          <div className="space-x-3">
            <a href="/find-id" className="hover:underline">
              아이디 찾기
            </a>
            <a href="/find-password" className="hover:underline">
              비밀번호 찾기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
