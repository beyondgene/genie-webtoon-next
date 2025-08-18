'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { findPasswordSchema, type FindPasswordInput } from '@/lib/validators/auth';
import FormField from '@/components/public/FormField';

export default function FindPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FindPasswordInput>({
    resolver: zodResolver(findPasswordSchema),
  });

  const onSubmit = async (data: FindPasswordInput) => {
    const res = await fetch('/api/auth/find-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) return setError('phoneNumber', { message: '일치하는 정보가 없습니다.' });
    alert('비밀번호 재설정 링크를 전송했습니다. (임시 로직)');
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="아이디"
          placeholder="genie123"
          {...register('memberId')}
          error={errors.memberId}
        />
        <FormField label="이름" placeholder="홍길동" {...register('name')} error={errors.name} />
        <FormField
          label="전화번호"
          placeholder="010-1234-5678"
          {...register('phoneNumber')}
          error={errors.phoneNumber}
        />
        <button
          disabled={isSubmitting}
          className="w-full rounded-xl bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          재설정 링크 받기
        </button>
      </form>
    </main>
  );
}
