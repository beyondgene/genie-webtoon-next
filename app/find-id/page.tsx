// app/find-id/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// 프로젝트의 인증 전용 스키마를 사용합니다.
import { findIdSchema, type FindIdInput } from '@/lib/validators/auth';

function formatPhone(v: string) {
  // 010-1234-5678 형태로 하이픈 자동 삽입
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function FindIdPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FindIdInput>({ resolver: zodResolver(findIdSchema) });

  const [foundId, setFoundId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: FindIdInput) => {
    setFoundId(null);
    setServerError(null);

    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
      const res = await fetch(`${base}/api/auth/find-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        // 404: 회원 없음, 400: 유효성 오류 등
        setServerError(
          typeof json?.error === 'string'
            ? json.error
            : Array.isArray(json?.error)
              ? json.error.join('\n')
              : '일치하는 회원을 찾지 못했습니다.'
        );
        return;
      }
      setFoundId(json.memberId);
    } catch (e) {
      setServerError('아이디 찾기 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-start sm:items-center justify-center"
      style={{ background: '#929292' }}
    >
      <div className="w-[309px] sm:w-[309px] px-2 py-16 sm:py-0">
        {/* 상단 로고 박스 (로그인/회원가입과 동일 톤) */}
        <div className="mx-auto mb-8 grid h-[186px] w-[309px] place-content-center rounded-[4px] bg-[rgba(0,0,0,0.07)]">
          <span className="text-[22px] font-semibold tracking-wide text-white/90">
            GENIE WEBTOON
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[14px]">
          {/* 이름 */}
          <div>
            <label className="mb-[6px] block text-[16px] font-medium text-white">Name</label>
            <input
              type="text"
              placeholder="홍길동"
              className="h-[46px] w-[300px] rounded-[4px] bg-[#D9D9D9] px-3 text-[16px] text-black outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-white/90">{errors.name.message}</p>}
          </div>

          {/* 전화번호 */}
          <div>
            <label className="mb-[6px] block text-[16px] font-medium text-white">Phone</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="010-1234-5678"
              className="h-[46px] w-[300px] rounded-[4px] bg-[#D9D9D9] px-3 text-[16px] text-black outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('phoneNumber')}
              onChange={(e) =>
                setValue('phoneNumber', formatPhone(e.target.value), { shouldValidate: true })
              }
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-white/90">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-[45px] w-[300px] rounded-[4px] uppercase font-semibold text-[16px] shadow-md disabled:opacity-60"
            style={{ background: 'white', color: '#2148C0' }}
          >
            {isSubmitting ? '확인 중…' : '아이디 찾기'}
          </button>
        </form>

        {/* 결과/오류 */}
        <div className="mt-4 space-y-2">
          {foundId && (
            <div
              className="rounded-[6px] p-3 text-white"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid white' }}
            >
              <div className="text-sm opacity-90">조회된 아이디</div>
              <div className="text-lg font-semibold">{foundId}</div>
            </div>
          )}
          {serverError && <p className="text-[14px] text-red-100">{serverError}</p>}
        </div>

        {/* 하단 링크 */}
        <div className="mt-3 flex w-[300px] justify-between text-white">
          <a href="/login" className="text-[16px] font-medium hover:opacity-90">
            로그인
          </a>
          <a href="/find-password" className="text-[16px] font-medium hover:opacity-90">
            비밀번호 찾기
          </a>
        </div>
      </div>
    </div>
  );
}
