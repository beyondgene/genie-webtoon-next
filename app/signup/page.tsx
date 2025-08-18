'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validators/auth';
import FormField from '@/components/public/FormField';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) });
    if (res.ok) router.push('/login?joined=1');
  };

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-bold">회원가입</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
        <FormField
          label="아이디"
          placeholder="영문/숫자 4~20자"
          {...register('memberId')}
          error={errors.memberId}
        />
        <FormField
          label="비밀번호"
          type="password"
          {...register('password')}
          error={errors.password}
        />
        <FormField
          label="비밀번호 확인"
          type="password"
          {...register('passwordConfirm')}
          error={errors.passwordConfirm}
        />
        <FormField label="이름" placeholder="홍길동" {...register('name')} error={errors.name} />
        <FormField
          label="닉네임"
          placeholder="지니팬"
          {...register('nickname')}
          error={errors.nickname}
        />
        <FormField
          label="이메일"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email}
        />
        <FormField
          label="전화번호"
          placeholder="010-1234-5678"
          {...register('phoneNumber')}
          error={errors.phoneNumber}
        />
        <FormField
          label="생년월일"
          placeholder="YYYY-MM-DD"
          {...register('birth')}
          error={errors.birth}
        />
        <button
          disabled={isSubmitting}
          className="mt-2 rounded-xl bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          가입하기
        </button>
      </form>
    </main>
  );
}
