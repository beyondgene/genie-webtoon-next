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

export default function SignupPage() {
  const router = useRouter();
  const pathname = usePathname(); // 하드 리로드용(새로고침후 재로딩)
  const { data: session } = useSession();
  const emailFromSession = (session?.user as any)?.email ?? '';
  const isSocialOnboarding =
    (session?.user as any)?.onboarding === true && !!(session?.user as any)?.oauthProvider;

  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<null | boolean>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { gender: 'MALE' },
  });

  useEffect(() => {
    if (!isSocialOnboarding) return; // ← 온보딩일 때만 채움
    const u = (session as any)?.user ?? {};
    if (typeof u?.name === 'string' && !watch('name')) setValue('name', u.name);
    // 이메일은 기본값으로만 설정하고 수정 가능하게 유지
    if (typeof u?.email === 'string' && !watch('email')) setValue('email', u.email);
  }, [session, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const memberId = watch('memberId');

  // 공통 스타일(피그마 지정값)
  const inputClass =
    'h-[46px] w-full rounded-[4px] bg-transparent px-4 text-white placeholder-white/85 outline-none';
  const inputStyle = useMemo(() => ({ border: '1px solid white' }), []);
  const labelClass = 'mt-1 text-xs text-white/90';

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
    const parsed = signupSchema.safeParse(raw); // ✅ 프로젝트 정책 그대로 적용

    if (parsed.success) return; // 통과 시 RHF/zod/서버 제출 진행

    // 우선순위에 맞춰 에러 메시지 1건만 노출 (요청사항대로 '각 상황 발생 시 팝업 + 새로고침')
    const { fieldErrors, formErrors } = parsed.error.flatten();

    // 1) 비밀번호 규칙 불일치
    if (fieldErrors.password?.length) {
      e.preventDefault();
      alert(fieldErrors.password[0] || '비밀번호가 입력 규칙에 맞지 않습니다.');
      return void setTimeout(() => window.location.replace(pathname), 0);
    }

    // 2) 비밀번호 재입력 불일치(스키마에서 passwordConfirm/refine, 혹은 formErrors)
    if (fieldErrors.passwordConfirm?.length || formErrors?.length) {
      e.preventDefault();
      // formErrors에 불일치 메시지를 넣는 스키마라면 우선 사용
      const msg =
        fieldErrors.passwordConfirm?.[0] || formErrors[0] || '재입력 비밀번호가 일치하지 않습니다.';
      alert(msg);
      return void setTimeout(() => window.location.replace(pathname), 0);
    }

    // 3) 이름(최대 글자수 이슈로 비워지거나 규칙 불일치 포함)
    if (fieldErrors.name?.length) {
      e.preventDefault();
      alert(fieldErrors.name[0] || '이름을 입력해주세요.');
      return void setTimeout(() => window.location.replace(pathname), 0);
    }

    // 4) 이메일 형식 오류
    if (fieldErrors.email?.length) {
      e.preventDefault();
      alert(fieldErrors.email[0] || '이메일 형식이 올바르지 않습니다.');
      return void setTimeout(() => window.location.replace(pathname), 0);
    }

    // 5) 전화번호 형식 오류
    if (fieldErrors.phoneNumber?.length) {
      e.preventDefault();
      alert(
        fieldErrors.phoneNumber[0] || '전화번호 입력 형식이 올바르지 않습니다. 예) 010-1234-5678'
      );
      return void setTimeout(() => window.location.replace(pathname), 0);
    }

    // 6) 생년월일 형식 오류
    if (fieldErrors.birthday?.length) {
      e.preventDefault();
      alert(fieldErrors.birthday[0] || '생년월일 입력 형식이 올바르지 않습니다. 예) 1990-01-01');
      return void setTimeout(() => window.location.replace(pathname), 0);
    }

    // 7) 주소 미입력
    if (fieldErrors.address?.length) {
      e.preventDefault();
      alert(fieldErrors.address[0] || '주소를 입력해주세요.');
      return void setTimeout(() => window.location.replace(pathname), 0);
    }
  };

  // 회원가입
  const onSubmit = async (raw: SignupInput) => {
    // 소셜 로그인 온보딩인 경우 추가 처리
    const payload = {
      memberId: raw.memberId.trim(),
      memberPassword: raw.password,
      nickname: (raw.nickname ?? raw.name).trim(),
      name: s(raw.name),
      birthDate: (raw.birthday ?? '').trim().replace(/\//g, '-'),
      gender: raw.gender ?? 'OTHER',
      email: s(raw.email),
      phoneNumber: s(raw.phoneNumber),
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
        <div className="mx-auto mb-10 grid h-[186px] w-[309px] place-content-center rounded bg-[#696969] text-white">
          <span className="text-xl font-semibold tracking-wide">GENIE WEBTOON</span>
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
              placeholder="ID"
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
              {checking ? 'Checking…' : 'Double Check'}
            </button>
            {available !== null && (
              <p className={`mt-1 text-xs ${available ? 'text-green-200' : 'text-red-200'}`}>
                {available ? '사용 가능한 ID입니다.' : '이미 사용 중인 ID입니다.'}
              </p>
            )}
          </div>

          {/* PW */}
          <div className="sm:col-span-12">
            <input
              type="password"
              placeholder="PW"
              className={inputClass}
              style={inputStyle}
              {...register('password')}
            />
            {errors.password && <p className={labelClass}>{errors.password.message}</p>}
          </div>

          {/* PW 확인 */}
          <div className="sm:col-span-12">
            <input
              type="password"
              placeholder="PASSWORD CONFIRM"
              className={inputClass}
              style={inputStyle}
              {...register('passwordConfirm')}
            />
            {errors.passwordConfirm && (
              <p className={labelClass}>{errors.passwordConfirm.message}</p>
            )}
          </div>

          {/* NAME */}
          <div className="sm:col-span-12">
            <input
              placeholder="NAME"
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
              {...register('gender')}
              defaultValue="OTHER"
            >
              <option value="MALE" className="text-black">
                MALE
              </option>
              <option value="FEMALE" className="text-black">
                FEMALE
              </option>
              <option value="OTHER" className="text-black">
                OTHER
              </option>
            </select>
            {errors.gender && <p className={labelClass}>{errors.gender.message}</p>}
          </div>

          {/* NICKNAME */}
          <div className="sm:col-span-12">
            <input
              placeholder="NICKNAME"
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
              placeholder="EMAIL"
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
              placeholder="PHONE (010-1234-5678)"
              className={inputClass}
              style={inputStyle}
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && <p className={labelClass}>{errors.phoneNumber.message}</p>}
          </div>

          {/* BIRTH */}
          <div className="sm:col-span-12">
            <input
              placeholder="BIRTH(YYYY-MM-DD)"
              className={inputClass}
              style={inputStyle}
              {...register('birthday')}
            />
            {errors.birthday && <p className={labelClass}>{errors.birthday.message}</p>}
          </div>

          {/* ADDRESS */}
          <div className="sm:col-span-12">
            <input
              placeholder="ADDRESS"
              className={inputClass}
              style={inputStyle}
              {...register('address')}
            />
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
              {isSubmitting ? 'Registering…' : 'Register'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
