// app/find-password/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// 프로젝트의 인증 전용 스키마를 사용합니다.
import { findPasswordSchema, type FindPasswordInput } from '@/lib/validators/auth';
import BackNavigator from '@/components/ui/BackNavigator';

// 휴대폰 번호 로직
function formatPhone(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function FindPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<FindPasswordInput>({ resolver: zodResolver(findPasswordSchema) });

  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: FindPasswordInput) => {
    setServerMsg(null);
    setServerError(null);
    //api에 작성된 비밀번호 찾기 라우터 호출
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
      const res = await fetch(`${base}/api/auth/find-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(
          typeof json?.error === 'string'
            ? json.error
            : Array.isArray(json?.error)
              ? json.error.join('\n')
              : '비밀번호 찾기 요청이 실패했습니다.'
        );
        return;
      }

      // 성공 메시지 표기 (임시 비밀번호 메일 발송)
      setServerMsg(
        json?.message ||
          '임시 비밀번호를 이메일로 발송했습니다. 로그인 후 반드시 비밀번호를 변경해주세요.'
      );
      // 개인정보 입력값은 비워주기
      reset({ memberId: '', name: '', phoneNumber: '' });
    } catch (e) {
      setServerError('비밀번호 찾기 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-start sm:items-center justify-center"
      style={{ background: '#4f4f4f' /* 기존 #929292 */ }}
    >
      <BackNavigator />
      <div className="w-[309px] sm:w-[309px] px-2 py-16 sm:py-0">
        {/* 상단 로고 박스 기존 bg-[rgba(0,0,0,0.07)] */}
        <div className="mx-auto mb-8 grid h-[186px] w-[309px] place-content-center rounded-[4px] bg-[#696969]">
          <span className="text-[22px] font-semibold tracking-wide text-white/90">
            GENIE WEBTOON
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[14px]">
          {/* 아이디 bg-[#D9D9D9] */}
          <div>
            <label className="mb-[6px] block text-[16px] font-medium text-white">ID</label>
            <input
              type="text"
              placeholder="genie1234"
              className="h-[46px] w-[300px] rounded-[4px] bg-[#4f4f4f] px-3 text-[16px] text-white placeholder-white/90 caret-white outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('memberId')}
            />
            {errors.memberId && (
              <p className="mt-1 text-xs text-white/90">{errors.memberId.message}</p>
            )}
          </div>

          {/* 이름 bg-[#D9D9D9] */}
          <div>
            <label className="mb-[6px] block text-[16px] font-medium text-white">Name</label>
            <input
              type="text"
              placeholder="홍길동"
              className="h-[46px] w-[300px] rounded-[4px] bg-[#4f4f4f] px-3 text-[16px] text-white placeholder-white/90 caret-white outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-white/90">{errors.name.message}</p>}
          </div>

          {/* 전화번호 bg-[#D9D9D9] */}
          <div>
            <label className="mb-[6px] block text-[16px] font-medium text-white">Phone</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="010-1234-5678"
              className="h-[46px] w-[300px] rounded-[4px] bg-[#4f4f4f] px-3 text-[16px] text-white placeholder-white/90 caret-white outline-none"
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
            {isSubmitting ? '요청 중…' : '임시 비밀번호 받기'}
          </button>
        </form>

        {/* 결과/오류 */}
        <div className="mt-4 space-y-2">
          {serverMsg && (
            <div
              className="rounded-[6px] p-3 text-white"
              style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid white' }}
            >
              <div className="text-sm opacity-90">안내</div>
              <div className="text-[15px]">{serverMsg}</div>
            </div>
          )}
          {serverError && <p className="text-[14px] text-red-100">{serverError}</p>}
        </div>

        {/* 하단 링크 */}
        <div className="mt-3 flex w-[300px] justify-between text-white">
          <a href="/login" className="text-[16px] font-medium hover:opacity-90">
            로그인
          </a>
          <a href="/find-id" className="text-[16px] font-medium hover:opacity-90">
            아이디 찾기
          </a>
        </div>
      </div>
    </div>
  );
}
