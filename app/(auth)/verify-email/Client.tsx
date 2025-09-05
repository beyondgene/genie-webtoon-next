'use client';

// 이 컴포넌트는 실제 UI와 브라우저 상호작용(라우터 이동, fetch 등)을 담당합니다.
// Server Component(상위 page.tsx)에서 토큰을 prop으로 전달받기 때문에
// 여기서는 useSearchParams 훅이 전혀 필요 없습니다. (Suspense 경계 문제 해소)

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// 상태 머신 형태의 유니온 타입으로 UI 상태를 명확히 관리합니다.
type State =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; msg: string }
  | { type: 'error'; msg: string };

// 이메일 인증 UI + 동작
export default function VerifyEmailClient({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ type: 'idle' });

  // 스타일은 재생성 방지를 위해 useMemo로 고정 (미세 성능 + 의도 명확화)
  const boxClass = 'mx-auto max-w-[480px] rounded-[8px] bg-black/15 px-6 py-8 text-white shadow-md';
  const buttonClass = 'h-[46px] w-full rounded-[4px] uppercase text-white disabled:opacity-60';
  const inputStyle = useMemo(() => ({ border: '1px solid white' }), []);

  useEffect(() => {
    // 토큰이 없으면 즉시 에러 상태로 전환
    if (!token) {
      setState({ type: 'error', msg: '유효하지 않은 인증 요청입니다.(토큰 누락)' });
      return;
    }

    // 마운트 시 한 번만 인증 API를 호출해 결과를 반영
    const run = async () => {
      setState({ type: 'loading' });
      try {
        // 서버 API 호출: 이 엔드포인트는 프로젝트의 실제 구현에 맞춰 존재해야 합니다.
        // 캐시는 사용하지 않고(no-store), 실패 시 메시지를 깔끔히 보여줍니다.
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          cache: 'no-store',
        });

        const json = await res.json().catch(() => ({}));

        if (res.ok) {
          // 성공 메시지는 서버에서 내려주는 값을 우선 사용
          setState({
            type: 'success',
            msg: json?.message ?? '이메일 인증이 완료되었습니다.',
          });
        } else {
          // 실패 시 서버 전달 에러 메시지 혹은 기본 메시지 출력
          setState({
            type: 'error',
            msg: json?.error ?? '인증 처리에 실패했습니다.',
          });
        }
      } catch {
        // 네트워크/예외 처리
        setState({ type: 'error', msg: '인증 처리 중 오류가 발생했습니다.' });
      }
    };

    run();
  }, [token]);

  return (
    <div className="min-h-screen w-full" style={{ background: '#929292' }}>
      <main className="mx-auto max-w-[1040px] px-4 py-12">
        {/* 상단 로고/헤더: 디자인 시스템에 맞게 교체 가능 */}
        <div className="mx-auto mb-10 grid h-[186px] w-[309px] place-content-center rounded bg-black/10 text-white">
          <span className="text-xl font-semibold tracking-wide">GENIE WEBTOON</span>
        </div>

        {/* 본문 컨테이너 */}
        <section className={boxClass} style={inputStyle}>
          <h1 className="mb-4 text-lg font-semibold">이메일 인증</h1>

          {/* 로딩 상태 */}
          {state.type === 'loading' && <p className="text-white/90">인증을 처리 중입니다…</p>}

          {/* 성공 상태: 로그인으로 유도 */}
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

          {/* 실패 상태: 재시도 동선 제공 */}
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
