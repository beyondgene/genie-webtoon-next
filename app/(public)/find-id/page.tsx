'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { findIdSchema, type FindIdInput } from '@/lib/validators/auth';
import FormField from '@/components/public/FormField';

export default function FindIdPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FindIdInput>({
    resolver: zodResolver(findIdSchema),
  });

  const onSubmit = async (data: FindIdInput) => {
    const res = await fetch('/api/auth/find-id', { method: 'POST', body: JSON.stringify(data) });
    if (!res.ok) return setError('phoneNumber', { message: '일치하는 계정을 찾지 못했습니다.' });
    const { memberId } = await res.json();
    alert(`고객님의 아이디는 "${memberId}" 입니다.`);
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">아이디 찾기</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          아이디 찾기
        </button>
      </form>
    </main>
  );
}
