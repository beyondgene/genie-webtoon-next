// app/find-password/page.tsx
'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// 프로젝트의 인증 전용 스키마
import { findPasswordSchema, type FindPasswordInput } from '@/lib/validators/auth';
import BackNavigator from '@/components/ui/BackNavigator';
import { usePathname } from 'next/navigation';

// 휴대폰 번호 하이픈 자동 삽입
function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);

  if (d.length < 4) return d; // 3
  if (d.length < 7) return `${d.slice(0, 3)}-${d.slice(3)}`; // 3-?

  // 총 10자리(예: 011,016 등 구형): 3-3-4
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;

  // 총 11자리(예: 010): 3-4-4
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function FindPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
    reset,
  } = useForm<FindPasswordInput>({ resolver: zodResolver(findPasswordSchema) });

  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const pathname = usePathname();

  // ✅ RHF/zod보다 먼저 실행되는 '캡처 단계' 가드
  const onSubmitGate: React.FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      const { memberId, name, phoneNumber } = getValues();
      const idOk = !!memberId?.trim();
      const nameOk = !!name?.trim();
      const phoneOk = !!phoneNumber?.trim();

      // 전화번호 형식이 말이 안 되면 미입력처럼 취급(가벼운 체크: 10~11자리)
      const digits = (phoneNumber || '').replace(/\D/g, '');
      const phoneLooksInvalid = phoneOk && (digits.length < 10 || digits.length > 11);

      if (!idOk || !nameOk || !phoneOk || phoneLooksInvalid) {
        e.preventDefault(); // ➜ RHF/zod/서버 요청 자체 차단
        alert('아이디, 이름, 전화번호를 모두 입력해주세요!');
        setTimeout(() => window.location.replace(pathname), 0); // 히스토리 오염 없이 하드 리로드
      }
    },
    [getValues, pathname]
  );

  // 세 필드 중 하나라도 비어 있으면 공통 팝업(백업용)
  const onInvalid = useCallback(() => {
    const { memberId, name, phoneNumber } = getValues();
    const idOk = !!memberId?.trim();
    const nameOk = !!name?.trim();
    const phoneOk = !!phoneNumber?.trim();
    if (!idOk || !nameOk || !phoneOk) {
      alert('아이디, 이름, 전화번호를 모두 입력해주세요!');
      setTimeout(() => window.location.replace(pathname), 0);
    }
  }, [getValues, pathname]);

  const onSubmit = async (data: FindPasswordInput) => {
    // ✅ 정상 케이스 외 방어적 체크(백업)
    const idOk = !!data.memberId?.trim();
    const nameOk = !!data.name?.trim();
    const phoneOk = !!data.phoneNumber?.trim();
    const digits = (data.phoneNumber || '').replace(/\D/g, '');
    const phoneLooksInvalid = phoneOk && (digits.length < 10 || digits.length > 11);

    if (!idOk || !nameOk || !phoneOk || phoneLooksInvalid) {
      alert('아이디, 이름, 전화번호를 모두 입력해주세요!');
      setTimeout(() => window.location.replace(pathname), 0);
      return;
    }

    setServerMsg(null);
    setServerError(null);

    try {
      // const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''; ${base}
      const res = await fetch(`/api/auth/find-password`, {
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
    } catch {
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
        {/* 상단 로고 박스 */}
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
          {/* 아이디 */}
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

          {/* 이름 */}
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

          {/* 전화번호 */}
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
