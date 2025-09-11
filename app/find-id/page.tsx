// app/find-id/page.tsx
'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldErrors } from 'react-hook-form';
// 프로젝트의 인증 전용 스키마를 사용
import { findIdSchema, type FindIdInput } from '@/lib/validators/auth';
import BackNavigator from '@/components/ui/BackNavigator';
import { usePathname } from 'next/navigation'; // 추가

// 핸드폰 번호 로직
function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);

  if (d.length < 4) return d; // 3
  if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`; // 3-?

  // 총 10자리(예: 011,016 등 구형): 3-3-4
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;

  // 총 11자리(예: 010): 3-4-4
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function FindIdPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<FindIdInput>({ resolver: zodResolver(findIdSchema) });

  const [foundId, setFoundId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const pathname = usePathname(); // ✅ 추가

  // ✅ RHF/zod보다 먼저 실행되는 '캡처 단계' 가드
  const onSubmitGate: React.FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      const { name, phoneNumber } = getValues();
      const hasName = !!name?.trim();
      const hasPhone = !!phoneNumber?.trim();

      // 전화번호가 형식적으로 말이 안 되면 미입력처럼 간주
      const digits = (phoneNumber || '').replace(/\D/g, '');
      const phoneLooksInvalid = hasPhone && (digits.length < 10 || digits.length > 11);

      const onlyOneFilled = (hasName && !hasPhone) || (!hasName && hasPhone);

      // ⬇️ 둘 중 하나라도 미입력/형식 오류면: 무조건 팝업 → 즉시 재로딩
      if (!hasName || !hasPhone || phoneLooksInvalid || onlyOneFilled) {
        e.preventDefault(); // RHF/zod/서버 요청 자체 차단
        alert('이름과 전화번호 모두 입력해주세요!');
        setTimeout(() => window.location.replace(pathname), 0); // 히스토리 오염 없이 하드 리로드
      }
    },
    [getValues, pathname]
  );

  // 하나만 입력된 경우 공통 팝업 (백업용, 기존 유지)
  const onInvalid = useCallback(
    (errors: FieldErrors<FindIdInput>) => {
      const { name, phoneNumber } = getValues();
      const hasName = !!name?.trim();
      const hasPhone = !!phoneNumber?.trim();
      const phoneInvalid = !!errors.phoneNumber; // 형식 오류도 '미입력'처럼 취급

      const onlyOneFilled = (hasName && (!hasPhone || phoneInvalid)) || (!hasName && hasPhone);
      if (onlyOneFilled) {
        alert('이름과 전화번호 모두 입력해주세요!');
        setTimeout(() => window.location.replace(pathname), 0); // ✅ 재로딩 추가
        return;
      }
      // 그 외에는 필드별 에러 메시지를 그대로 노출
    },
    [getValues, pathname]
  );

  const onSubmit = async (data: FindIdInput) => {
    // ✅ 선행 입력 체크(백업). 캡처 가드가 있으므로 정상 케이스엔 통과
    const name = data.name?.trim() ?? '';
    const phone = data.phoneNumber?.trim() ?? '';
    const phoneInvalid = phone.length > 0 && !/^\d{3}-\d{3,4}-\d{4}$/.test(phone);

    if (!name || !phone || phoneInvalid) {
      alert('이름과 전화번호 모두 입력해주세요!');
      setTimeout(() => window.location.replace(pathname), 0); // ✅ 재로딩 추가
      return;
    }

    setFoundId(null);
    setServerError(null);

    try {
      // const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''; ${base}
      const res = await fetch(`/api/auth/find-id`, {
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
      style={{ background: '#4f4f4f' /* #929292 */ }}
    >
      <BackNavigator />
      <div className="w-[309px] sm:w-[309px] px-2 py-16 sm:py-0">
        {/* 상단 로고 박스 (로그인/회원가입과 동일 톤) 기존 bg-[rgba(0,0,0,0.07)] */}
        <div className="mx-auto mb-8 grid h-[186px] w-[309px] place-content-center rounded-[4px] bg-[#696969]">
          <span className="text-[22px] font-semibold tracking-wide text-white/90">
            GENIE WEBTOON
          </span>
        </div>

        <form
          noValidate
          onSubmitCapture={onSubmitGate} // ✅ 추가: 캡처 단계 가드
          onSubmit={handleSubmit(onSubmit, onInvalid)} // 기존 핸들러 유지
          className="space-y-[14px]"
        >
          {/* 이름 기존 bg-[#D9D9D9] */}
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
