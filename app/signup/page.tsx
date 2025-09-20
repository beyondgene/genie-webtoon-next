// app/signup/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validators/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import BackNavigator from '@/components/ui/BackNavigator';
import { Suspense } from 'react';
import SpeechBubble from '@/components/ui/SpeechBubble';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// window.daum 타입 선언(간단)
declare global {
  interface Window {
    daum?: any;
  }
}

const missingPasswordCategories = (value: string) => {
  if (!value) return [] as string[];
  const missing: string[] = [];
  if (!/[A-Za-z]/.test(value)) missing.push('영문');
  if (!/\d/.test(value)) missing.push('숫자');
  if (!/[^A-Za-z0-9]/.test(value)) missing.push('특수문자');
  return missing;
};

export default function SignupPage() {
  const router = useRouter();
  const pathname = usePathname(); // 하드 리로드용(새로고침후 재로딩)
  const { data: session } = useSession();
  const emailFromSession = (session?.user as any)?.email ?? '';
  const isSocialOnboarding =
    (session?.user as any)?.onboarding === true && !!(session?.user as any)?.oauthProvider;

  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<null | boolean>(null);
  const [showPw, setShowPw] = useState(false);
  const [postcodeReady, setPostcodeReady] = useState(false);

  // hexicons 아이콘 사용 시:
  // import { HiEye, HiEyeOff } from 'hexicons-react' (혹은 실제 패키지명)
  // 아래 EyeIcon/EyeOffIcon 대신 <HiEye/> / <HiEyeOff/> 사용
  const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 5c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { gender: 'OTHER' },
  });

  useEffect(() => {
    if (!isSocialOnboarding) return; // ← 온보딩일 때만 채움
    const u = (session as any)?.user ?? {};
    if (typeof u?.name === 'string' && !watch('name')) setValue('name', u.name);
    // 이메일은 기본값으로만 설정하고 수정 가능하게 유지
    if (typeof u?.email === 'string' && !watch('email')) setValue('email', u.email);
  }, [session, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const memberId = watch('memberId');
  const pw = watch('password');
  const pwc = watch('passwordConfirm');
  const pwMatch = useMemo<null | boolean>(() => {
    // 둘 다 비어있으면 표시 안 함, 둘 중 하나라도 없으면 표시 안 함
    if (!pw && !pwc) return null;
    if (!pw || !pwc) return null;
    return pw === pwc;
  }, [pw, pwc]);
  const pwMissing = useMemo(() => missingPasswordCategories(pw ?? ''), [pw]);

  // 공통 스타일(피그마 지정값)
  const inputClass =
    'h-[46px] w-full rounded-[4px] bg-transparent px-4 text-white placeholder-white/85 outline-none';
  const inputStyle = useMemo(() => ({ border: '1px solid white' }), []);
  const labelClass = 'mt-1 text-xs text-white/90';

  // (1) 다음 우편번호 스크립트 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.daum?.Postcode) {
      setPostcodeReady(true);
      return;
    }
    const s = document.createElement('script');
    s.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    s.onload = () => setPostcodeReady(true);
    s.onerror = () => setPostcodeReady(false);
    document.body.appendChild(s);
  }, []);

  // (2) 주소 검색 열기
  const openPostcode = () => {
    if (!window.daum?.Postcode) {
      alert('주소 검색 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        const addr = data.roadAddress || data.jibunAddress || '';
        // 필요 시 우편번호: data.zonecode
        setValue('address', addr, { shouldValidate: true, shouldDirty: true });
      },
    }).open();
  };

  // ID 중복 확인
  const onDoubleCheck = async () => {
    if (!memberId || !/^[A-Za-z0-9_]+$/.test(memberId)) {
      setAvailable(null);
      return alert('ID 형식을 확인하세요. (영문/숫자/언더바)');
    }
    try {
      setChecking(true);
      const res = await fetch('/api/auth/checkduplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      const json = await res.json();
      setAvailable(Boolean(json?.available));
    } catch {
      setAvailable(null);
      alert('중복 확인 중 오류가 발생했습니다.');
    } finally {
      setChecking(false);
    }
  };

  const s = (v?: string | null) => (v ?? '').trim();

  const onSubmitGate: React.FormEventHandler<HTMLFormElement> = (e) => {
    const raw = getValues(); // RHF 입력값
    const parsed = signupSchema.safeParse(raw); // 프로젝트 정책 그대로 적용
    // 성별 선택 여부 추가 검사
    if (raw.gender !== 'MALE' && raw.gender !== 'FEMALE') {
      e.preventDefault();
      e.stopPropagation();
      alert('성별을 선택해주세요.');
      return;
    }

    if (parsed.success) return; // 통과 시 RHF/zod/서버 제출 진행

    // 우선순위에 맞춰 에러 메시지 1건만 노출 (요청사항대로 '각 상황 발생 시 팝업 + 새로고침')
    const { fieldErrors, formErrors } = parsed.error.flatten();

    // 1) 비밀번호 규칙 불일치
    if (fieldErrors.password?.length) {
      e.preventDefault();
      e.stopPropagation();
      alert(fieldErrors.password[0] || '비밀번호가 입력 규칙에 맞지 않습니다.');
      return;
    }

    // 2) 비밀번호 재입력 불일치(스키마에서 passwordConfirm/refine, 혹은 formErrors)
    if (fieldErrors.passwordConfirm?.length || formErrors?.length) {
      e.preventDefault();
      e.stopPropagation();
      // formErrors에 불일치 메시지를 넣는 스키마라면 우선 사용
      const msg =
        fieldErrors.passwordConfirm?.[0] || formErrors[0] || '재입력 비밀번호가 일치하지 않습니다.';
      alert(msg);
      return;
    }

    // 3) 이름(최대 글자수 이슈로 비워지거나 규칙 불일치 포함)
    if (fieldErrors.name?.length) {
      e.preventDefault();
      e.stopPropagation();
      alert(fieldErrors.name[0] || '이름을 입력해주세요.');
      return;
    }

    // 4) 이메일 형식 오류
    if (fieldErrors.email?.length) {
      e.preventDefault();
      e.stopPropagation();
      alert(fieldErrors.email[0] || '이메일 형식이 올바르지 않습니다.');
      return;
    }

    // 5) 전화번호 형식 오류
    if (fieldErrors.phoneNumber?.length) {
      e.preventDefault();
      e.stopPropagation();
      alert(
        fieldErrors.phoneNumber[0] || '전화번호 입력 형식이 올바르지 않습니다. 예) 010-1234-5678'
      );
      return;
    }

    // 6) 생년월일 형식 오류
    if (fieldErrors.birthday?.length) {
      e.preventDefault();
      e.stopPropagation();
      alert(fieldErrors.birthday[0] || '생년월일 입력 형식이 올바르지 않습니다. 예) 1990-01-01');
      return;
    }

    // 7) 주소 미입력
    if (fieldErrors.address?.length) {
      e.preventDefault();
      e.stopPropagation();
      alert(fieldErrors.address[0] || '주소를 입력해주세요.');
      return;
    }
  };

  const formatPhone = (raw: string) => {
    const digits = (raw ?? '').replace(/\D/g, '');
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    return raw; // 그 외 길이는 그대로 둠(검증은 스키마가 처리)
  };

  // 회원가입
  const onSubmit = async (raw: SignupInput) => {
    // 소셜 로그인 온보딩인 경우 추가 처리
    const payload = {
      memberId: raw.memberId.trim(),
      memberPassword: raw.password,
      nickname: (raw.nickname ?? raw.name).trim(),
      name: s(raw.name),
      birthDate: (() => {
        const b = (raw.birthday ?? '').trim();
        const digits = b.replace(/\D/g, '');
        if (digits.length === 8) {
          return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
        }
        return b.replace(/[./]/g, '-');
      })(),
      gender: raw.gender ?? 'OTHER',
      email: s(raw.email),
      phoneNumber: formatPhone(s(raw.phoneNumber)),
      address: s(raw.address),
      // 소셜 로그인 정보가 있으면 함께 전송
      ...(isSocialOnboarding && {
        socialProvider: (session?.user as any)?.socialProvider,
        oauthUserId: (session?.user as any)?.oauthUserId,
        originalSocialEmail: emailFromSession, // 원래 소셜 이메일도 전송
      }),
    };

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(
        '회원가입이 완료되었습니다! 가입시 입력하신 이메일로 이동하여 인증절차를 마무리해주세요!'
      );
      router.push('/login?joined=1');
    } else {
      const { error } = await res.json().catch(() => ({ error: '회원가입 실패' }));
      alert(error ?? '회원가입 실패');
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: '#4f4f4f' /* #929292 */ }}>
      <main className="mx-auto max-w-[1040px] px-4 py-12">
        <BackNavigator />
        {/* 로고 영역 (임시) 기존 색상 bg-black/10 */}
        <div className="mx-auto mb-8 grid h-[186px] w-[309px] place-content-center rounded-[4px]">
          <SpeechBubble fill="#4f4f4f" className="w-[292px] h-[160px] px-5">
            <div className="grid h-full w-full place-items-center text-center">
              <span className="text-[22px] font-semibold tracking-wide text-white/90 translate-y-[1.5lh]">
                GENIE WEBTOON
              </span>
            </div>
          </SpeechBubble>
        </div>

        {/* 소셜 로그인 온보딩 안내 */}
        {isSocialOnboarding && (
          <div className="mx-auto mb-6 max-w-[1040px] rounded bg-blue-500/20 p-4 text-white">
            <p className="text-sm">
              🔗 {(session?.user as any)?.socialProvider?.toUpperCase()} 계정으로 연동 중입니다.
            </p>
            <p className="mt-1 text-xs text-white/80">
              추가 정보를 입력하여 회원가입을 완료하세요. 이메일은 자유롭게 변경 가능합니다.
            </p>
          </div>
        )}

        {/* 폼: 피그마 레이아웃(ID + DOUBLE CHECK 나란히) */}
        <form
          noValidate
          onSubmitCapture={onSubmitGate} // find-id와 동일한 '캡처 단계' 가드 연결
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto grid max-w-[1040px] grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-6"
        >
          {/* ID */}
          <div className="sm:col-span-7">
            <input
              placeholder="아이디"
              className={inputClass}
              style={inputStyle}
              {...register('memberId')}
            />
            {errors.memberId && <p className={labelClass}>{errors.memberId.message}</p>}
          </div>
          {/* DOUBLE CHECK */}
          <div className="sm:col-span-5">
            <button
              type="button"
              onClick={onDoubleCheck}
              disabled={checking}
              className="h-[46px] w-full rounded-[4px] uppercase text-white disabled:opacity-60"
              style={{ border: '1px solid white' }}
              aria-live="polite"
            >
              {checking ? '확인중…' : '중복 확인'}
            </button>
            {available !== null && (
              <p className={`mt-1 text-xs ${available ? 'text-green-200' : 'text-red-200'}`}>
                {available ? '사용 가능한 ID입니다.' : '이미 사용 중인 ID입니다.'}
              </p>
            )}
          </div>

          {/* PW */}
          <div className="sm:col-span-12 relative">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호(8자리 이상, 영문/숫자/특수문자 포함)"
                className={`${inputClass} pr-12`}
                style={inputStyle}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보이기'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none"
                tabIndex={-1}
              >
                {showPw ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className={labelClass}>{errors.password.message}</p>}
            {!errors.password && pw && pwMissing.length > 0 && (
              <p className="absolute top-full left-0 mt-1 text-xs text-white/90 z-10">
                비밀번호에 {pwMissing.join(', ')}을(를) 포함해주세요.
              </p>
            )}
          </div>

          {/* PW 확인 */}
          <div className="sm:col-span-12">
            <input
              type="password"
              placeholder="비밀번호 재입력"
              className={inputClass}
              style={inputStyle}
              {...register('passwordConfirm')}
            />
            {errors.passwordConfirm && (
              <p className={labelClass}>{errors.passwordConfirm.message}</p>
            )}
            {pwMatch !== null && !errors.passwordConfirm && (
              <p className={`mt-1 text-xs ${pwMatch ? 'text-green-200' : 'text-red-200'}`}>
                {pwMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          {/* NAME */}
          <div className="sm:col-span-12">
            <input
              placeholder="이름"
              className={inputClass}
              style={inputStyle}
              {...register('name')}
            />
            {errors.name && <p className={labelClass}>{errors.name.message}</p>}
          </div>

          {/* GENDER */}
          <div className="sm:col-span-12">
            <select
              className={inputClass}
              style={inputStyle}
              {...register('gender', {
                validate: (v) => v === 'MALE' || v === 'FEMALE' || '성별을 선택해주세요',
              })}
              defaultValue="OTHER" // RHF defaultValues와 일치
            >
              <option value="OTHER" className="text-black">
                성별
              </option>
              <option value="MALE" className="text-black">
                남자
              </option>
              <option value="FEMALE" className="text-black">
                여자
              </option>
            </select>
            {errors.gender && <p className={labelClass}>{errors.gender.message}</p>}
          </div>

          {/* NICKNAME */}
          <div className="sm:col-span-12">
            <input
              placeholder="닉네임"
              className={inputClass}
              style={inputStyle}
              {...register('nickname')}
            />
            {errors.nickname && <p className={labelClass}>{errors.nickname.message}</p>}
          </div>

          {/* EMAIL - 완전히 빈 상태로 시작 */}
          <div className="sm:col-span-12">
            <input
              type="email"
              placeholder="이메일"
              className={inputClass}
              style={inputStyle}
              {...register('email')}
              key="email-input" // 강제 리렌더링을 위한 key
            />
            {errors.email && <p className={labelClass}>{errors.email.message}</p>}
            {isSocialOnboarding && (
              <p className={labelClass}>
                💡 소셜 로그인 연동 중입니다. 사용하실 이메일을 입력해주세요.
              </p>
            )}
          </div>

          {/* PHONE */}
          <div className="sm:col-span-12">
            <input
              placeholder="전화번호(010-1234-5678)"
              className={inputClass}
              style={inputStyle}
              {...register('phoneNumber', {
                onBlur: (e) => {
                  const v = formatPhone(String(e.target.value));
                  if (v !== e.target.value) {
                    setValue('phoneNumber', v, { shouldValidate: true, shouldDirty: true });
                  }
                },
              })}
            />
            {errors.phoneNumber && <p className={labelClass}>{errors.phoneNumber.message}</p>}
          </div>

          {/* BIRTH */}
          <div className="sm:col-span-12">
            <input
              placeholder="생년월일(YYYY-MM-DD)"
              className={inputClass}
              style={inputStyle}
              {...register('birthday', {
                onBlur: (e) => {
                  const digits = String(e.target.value).replace(/\D/g, '');
                  if (digits.length === 8) {
                    const v = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
                    setValue('birthday', v, { shouldValidate: true, shouldDirty: true });
                  }
                },
              })}
            />
            {errors.birthday && <p className={labelClass}>{errors.birthday.message}</p>}
          </div>

          {/* ADDRESS */}
          <div className="sm:col-span-12 relative">
            <input
              placeholder="주소"
              className={`${inputClass} pr-28`} // 버튼 공간 확보
              style={inputStyle}
              {...register('address')}
            />
            <button
              type="button"
              onClick={openPostcode}
              disabled={!postcodeReady}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-[34px] px-3 rounded-[4px] uppercase text-white disabled:opacity-60"
              style={{ border: '1px solid white' }}
              aria-label="주소 검색"
            >
              주소 검색
            </button>
            {errors.address && <p className={labelClass}>{errors.address.message}</p>}
          </div>

          {/* REGISTER 버튼 */}
          <div className="sm:col-span-12 flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[46px] w-[300px] rounded-[4px] uppercase text-white disabled:opacity-60"
              style={{ border: '1px solid white' }}
            >
              {isSubmitting ? '등록중..' : '등록'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
