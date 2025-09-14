// app/login/page.tsx
'use client';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import SpeechBubble from '@/components/ui/SpeechBubble';
import KakaoBtn from '@/public/auth/kakao_login.png';

// (선택) 페이지 전용 폰트: 피그마가 Montserrat라면 같이 로드
import { Montserrat } from 'next/font/google';
const mont = Montserrat({
  subsets: ['latin'],
  weight: ['300', '500', '600'],
  variable: '--font-mont',
});

// ====== 기존 검증 로직 유지 ======
const schema = z.object({
  id: z
    .string()
    .min(1, 'ID를 입력하세요.')
    .regex(/^[A-Za-z0-9_]+$/, 'ID는 영문/숫자/밑줄만 허용됩니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/[A-Za-z]/, '영문을 포함해야 합니다.')
    .regex(/[0-9]/, '숫자를 포함해야 합니다.')
    .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다.'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, submitCount },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    criteriaMode: 'all', // 여러 규칙 위반도 수집
    mode: 'onSubmit',
  });

  // 1) 회원가입 폼과 같은 캡처 단계 가드
  const onSubmitGate: React.FormEventHandler<HTMLFormElement> = (e) => {
    const raw = getValues();
    const parsed = schema.safeParse(raw);
    if (parsed.success) return; // 통과 → 정상 제출

    e.preventDefault();
    e.stopPropagation();

    const { fieldErrors } = parsed.error.flatten();
    // PW 우선
    if (fieldErrors.password?.length) {
      alert(
        fieldErrors.password[0] || '비밀번호는 영문+숫자+특수문자를 포함해 8자 이상이어야 합니다.'
      );
      return;
    }
    // ID(회원 ID)
    if (fieldErrors.id?.length) {
      alert(fieldErrors.id[0] || '아이디를 입력해주세요.');
      return;
    }
    alert('입력값을 확인해주세요. (비밀번호는 영문+숫자+특수문자, 8자 이상)');
  };

  // 2) onInvalid가 호출되지 않는 환경까지 커버: 제출 시도 후 에러가 있으면 팝업 1회 보장
  const prevSubmitCount = useRef(0);
  useEffect(() => {
    if (submitCount > prevSubmitCount.current) {
      prevSubmitCount.current = submitCount;
      const hasErrors = !!errors && Object.keys(errors).length > 0;
      if (hasErrors) {
        const pwMsg = errors.password?.message as string | undefined;
        const idMsg = errors.id?.message as string | undefined;
        const fallback = '입력값을 확인해주세요. (비밀번호는 영문+숫자+특수문자, 8자 이상)';
        alert(pwMsg || idMsg || fallback);
      }
    }
  }, [submitCount, errors]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    // credentials 로그인 후 post-login으로 이동
    const res = await signIn('credentials', {
      memberId: data.id,
      password: data.password,
      redirect: false,
    });
    setSubmitting(false);

    if (res?.ok) {
      router.replace('/post-login');
    } else {
      reset({ id: '', password: '' });
      alert('로그인 실패: ID/PW를 확인하세요.');
    }
  };

  // (선택) onInvalid도 함께 두면 가장 먼저 팝업
  const onInvalid = (errs: typeof errors) => {
    const pwMsg = errs?.password?.message as string | undefined;
    const idMsg = errs?.id?.message as string | undefined;
    alert(pwMsg || idMsg || '입력값을 확인해주세요. (비밀번호는 영문+숫자+특수문자, 8자 이상)');
  };

  return (
    <div
      className={`${mont.variable} min-h-screen w-full flex items-start sm:items-center justify-center`}
      style={{
        background: '#4f4f4f' /* #929292 */,
        fontFamily: 'var(--font-mont), system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      {/* 가운데 컬럼 (피그마 기준 고정폭 요소들) */}
      <div className="w-[309px] sm:w-[309px] px-2 py-16 sm:py-0">
        {/* 로고 영역: 실제 이미지를 쓰실 거면 src 교체하세요, bg rgba(0,0,0,0.7) */}
        <div className="mx-auto mb-8 grid h-[186px] w-[309px] place-content-center rounded-[4px]">
          {/* 예비 텍스트 (이미지 없을 때) */}
          <SpeechBubble fill="#4f4f4f" className="w-[292px] h-[160px] px-5">
            <div className="grid h-full w-full place-items-center text-center">
              <span className="text-[22px] font-semibold tracking-wide text-white/90 translate-y-[1.5lh]">
                GENIE WEBTOON
              </span>
            </div>
          </SpeechBubble>
        </div>

        {/* 폼 */}
        <form
          noValidate
          onSubmitCapture={onSubmitGate} // ✅ 회원가입 폼과 동일한 캡처 가드
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-[14px]"
        >
          {/* ID */}
          <div className="relative">
            <input
              type="text"
              autoComplete="username"
              placeholder="ID" // placeholder를 대문자로
              className="w-[300px] h-[45px] rounded-[4px] bg-transparent text-white placeholder-white/80 px-[14px] outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('id')}
              aria-invalid={!!errors.id || undefined}
            />
            {errors.id && <p className="mt-1 text-xs text-white/90">{errors.id.message}</p>}
          </div>

          {/* PW */}
          <div className="relative">
            <input
              type="password"
              autoComplete="current-password"
              placeholder="PW"
              className="w-[300px] h-[45px] rounded-[4px] bg-transparent text-white placeholder-white/80 px-[14px] outline-none"
              style={{ border: '1px solid white', lineHeight: '20px' }}
              {...register('password')}
              aria-invalid={!!errors.password || undefined}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-white/90">{errors.password.message}</p>
            )}
          </div>

          {/* LOGIN 버튼: 흰 배경 + 파란 텍스트 + drop shadow */}
          <button
            type="submit"
            disabled={submitting}
            className="w-[300px] h-[45px] rounded-[4px] uppercase font-semibold text-[16px] shadow-md disabled:opacity-60"
            style={{
              background: 'white',
              color: '#2148C0',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.30)',
            }}
          >
            {submitting ? '로그인 중…' : 'LOGIN'}
          </button>
        </form>

        {/* 링크 3개 */}
        <div className="mt-3 flex w-[300px] justify-between text-white">
          <a href="/signup" className="text-[16px] font-medium hover:opacity-90">
            회원가입
          </a>
          <a href="/find-id" className="text-[16px] font-medium hover:opacity-90">
            아이디 찾기
          </a>
          <a href="/find-password" className="text-[16px] font-medium hover:opacity-90">
            비밀번호 찾기
          </a>
        </div>

        {/* 소셜 로그인 - callbackUrl을 post-login으로 변경 */}
        <div className="mt-6 flex w-[300px] items-center justify-center gap-4">
          <button
            onClick={() => signIn('kakao', { callbackUrl: '/post-login' })}
            aria-label="카카오로 로그인"
            className="inline-flex"
          >
            <Image src={KakaoBtn} alt="카카오 로그인" width={44} height={44} priority />
          </button>
        </div>
      </div>
    </div>
  );
}
