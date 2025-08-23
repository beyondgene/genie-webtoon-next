// app/(auth)/verify-email/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; msg: string }
  | { type: 'error'; msg: string };

export default function VerifyEmailPage() {
  const router = useRouter();
  const qs = useSearchParams();
  const token = qs.get('token') ?? '';

  const [state, setState] = useState<State>({ type: 'idle' });

  const boxClass = 'mx-auto max-w-[480px] rounded-[8px] bg-black/15 px-6 py-8 text-white shadow-md';
  const buttonClass = 'h-[46px] w-full rounded-[4px] uppercase text-white disabled:opacity-60';
  const inputStyle = useMemo(() => ({ border: '1px solid white' }), []);

  useEffect(() => {
    if (!token) {
      setState({ type: 'error', msg: '유효하지 않은 인증 요청입니다.(토큰 누락)' });
      return;
    }
    const run = async () => {
      setState({ type: 'loading' });
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const json = await res.json();
        if (res.ok) {
          setState({ type: 'success', msg: json?.message ?? '이메일 인증이 완료되었습니다.' });
        } else {
          setState({ type: 'error', msg: json?.error ?? '인증 처리에 실패했습니다.' });
        }
      } catch {
        setState({ type: 'error', msg: '인증 처리 중 오류가 발생했습니다.' });
      }
    };
    run();
  }, [token]);

  return (
    <div className="min-h-screen w-full" style={{ background: '#929292' }}>
      <main className="mx-auto max-w-[1040px] px-4 py-12">
        <div className="mx-auto mb-10 grid h-[186px] w-[309px] place-content-center rounded bg-black/10 text-white">
          <span className="text-xl font-semibold tracking-wide">GENIE WEBTOON</span>
        </div>

        <section className={boxClass} style={inputStyle}>
          <h1 className="mb-4 text-lg font-semibold">이메일 인증</h1>

          {state.type === 'loading' && <p className="text-white/90">인증을 처리 중입니다…</p>}

          {state.type === 'success' && (
            <>
              <p className="mb-6 text-white/90">{state.msg}</p>
              <button
                className={buttonClass}
                style={{ border: '1px solid white' }}
                onClick={() => router.push('/login')}
              >
                로그인하기
              </button>
            </>
          )}

          {state.type === 'error' && (
            <>
              <p className="mb-6 text-red-200">{state.msg}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={buttonClass}
                  style={{ border: '1px solid white' }}
                  onClick={() => router.push('/signup')}
                >
                  재가입 시도
                </button>
                <button
                  className={buttonClass}
                  style={{ border: '1px solid white' }}
                  onClick={() => router.push('/')}
                >
                  메인으로
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
