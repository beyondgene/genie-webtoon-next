'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import FormField from '@/components/public/FormField';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    await signIn('credentials', {
      memberId: data.memberId,
      password: data.password,
      callbackUrl: '/',
    });
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="아이디"
          placeholder="genie123"
          {...register('memberId')}
          error={errors.memberId}
        />
        <FormField
          label="비밀번호"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password}
        />
        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          로그인
        </button>
      </form>
      <div className="flex items-center justify-between text-sm text-zinc-600">
        <Link href="/signup">회원가입</Link>
        <div className="space-x-3">
          <Link href="/find-id">아이디 찾기</Link>
          <Link href="/find-password">비밀번호 찾기</Link>
        </div>
      </div>
    </main>
  );
}
