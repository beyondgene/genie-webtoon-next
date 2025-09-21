'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackNavigator from '@/components/ui/BackNavigator';
import { routes } from '@/lib/route';
import type { GoldenBellQuestion } from '@/data/goldenBell/questions';

type QuestionSetMeta = {
  webtoonId: number;
  webtoonName: string;
  questionCount: number;
};

type QuestionSetResponse = {
  webtoonId: number;
  webtoonName: string;
  questions: GoldenBellQuestion[];
};

// 버튼 스타일 디자인
const btnStyle: React.CSSProperties = {
  background: 'white',
  color: '#2148C0',
  boxShadow: '0px 4px 4px rgba(0,0,0,0.30)',
  borderRadius: 4,
};
// 도전 골든벨 페이지
export default function GoldenBellPage() {
  const router = useRouter();
  const [step, setStep] = useState<'idle' | 'playing' | 'done'>('idle');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [metas, setMetas] = useState<QuestionSetMeta[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [selectedWebtoon, setSelectedWebtoon] = useState<number | ''>('');
  const [activeWebtoon, setActiveWebtoon] = useState<number | null>(null);
  const [questions, setQuestions] = useState<GoldenBellQuestion[]>([]);
  const [questionSetTitle, setQuestionSetTitle] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const current = useMemo(() => questions[idx], [idx, questions]);

  useEffect(() => {
    let cancelled = false;
    async function loadMetas() {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const res = await fetch(routes.genieai.goldenBell, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const message =
            typeof data?.error === 'string' ? data.error : '문제 목록을 불러오지 못했습니다.';
          throw new Error(message);
        }
        const sets = (data?.sets ?? []) as QuestionSetMeta[];
        if (!cancelled) {
          setMetas(sets);
          if (sets.length) {
            setSelectedWebtoon(sets[0]!.webtoonId);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '문제 목록을 불러오지 못했습니다.';
          setMetaError(message);
        }
      } finally {
        if (!cancelled) {
          setMetaLoading(false);
        }
      }
    }
    loadMetas();
    return () => {
      cancelled = true;
    };
  }, []);

  const resetProgress = () => {
    setScore(0);
    setIdx(0);
    setStep('playing');
    setChosen(null);
    setIsCorrect(null);
  };

  const restart = () => {
    if (!questions.length) return;
    resetProgress();
  };

  const start = async () => {
    if (!selectedWebtoon) return;
    setQuestionError(null);

    if (activeWebtoon === selectedWebtoon && questions.length) {
      resetProgress();
      return;
    }

    setIsLoadingQuestions(true);
    try {
      const res = await fetch(routes.genieai.goldenBellByWebtoon(selectedWebtoon), {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.status === 403) {
        window.alert('구독 후 이용해주세요.');
        router.replace('/genieai/golden-bell');
        return;
      }
      const data = (await res.json().catch(() => null)) as QuestionSetResponse | null;
      if (!res.ok || !data) {
        const message =
          data && typeof (data as any).error === 'string'
            ? (data as any).error
            : '문제를 불러오지 못했습니다.';
        throw new Error(message);
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('등록된 문제가 없습니다.');
      }

      setQuestions(data.questions);
      setQuestionSetTitle(data.webtoonName);
      setActiveWebtoon(data.webtoonId);
      resetProgress();
    } catch (err) {
      const message = err instanceof Error ? err.message : '문제를 불러오지 못했습니다.';
      setQuestionError(message);
      setStep('idle');
      setActiveWebtoon(null);
      setQuestions([]);
      setQuestionSetTitle('');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // 마우스로 정답 클릭 로직
  const pick = (i: number) => {
    if (chosen !== null) return; // 이미 선택했으면 무시
    setChosen(i);
    const ok = current?.answer === i;
    setIsCorrect(ok);
    if (ok) setScore((s) => s + 1);
  };

  const goNext = () => {
    if (idx + 1 >= questions.length) {
      // 결과 화면 전환 전 선택/정오 상태 초기화
      setChosen(null);
      setIsCorrect(null);
      setStep('done');
      return;
    }
    setIdx((v) => v + 1);
    setChosen(null);
    setIsCorrect(null);
    // 스크롤 상단 정렬이 필요하면 다음 줄 주석 해제
    // window?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalQuestions = questions.length;
  const showIdleStart = step === 'idle';
  const disableStartButton = !selectedWebtoon || isLoadingQuestions || metaLoading;

  // STEP 3개 순서대로 시작 로직, 문제 푸는 도중 로직, 문제를 다풀고 점수가 나온 후 로직
  return (
    <>
      <BackNavigator />

      {/* 전체 화면 배경(양옆 포함) */}
      <div className="fixed inset-0 bg-[#4f4f4f]" aria-hidden />
      <main className="relative z-10 mx-auto min-h-screen max-w-4xl px-4 py-10 text-white md:px-6">
        <header className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">도전! 골든벨</h1>
            <p className="mt-1 text-sm text-white/80">웹툰 퀴즈를 풀고 1등에 도전하세요.</p>
            {questionSetTitle && step !== 'idle' && (
              <p className="mt-2 text-sm text-white/70">선택한 웹툰: {questionSetTitle}</p>
            )}
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-white/70 p-6">
          <h2 className="text-lg font-semibold">문제 선택</h2>
          <p className="mt-1 text-sm text-white/70">구독 중인 웹툰을 선택하고 퀴즈를 시작하세요.</p>
          {metaError && <p className="mt-3 text-sm text-red-300">{metaError}</p>}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              <span className="text-white/80">웹툰 선택</span>
              <select
                value={selectedWebtoon}
                onChange={(event) => {
                  const { value } = event.target;
                  setSelectedWebtoon(value === '' ? '' : Number(value));
                  setStep('idle');
                  setScore(0);
                  setIdx(0);
                  setChosen(null);
                  setIsCorrect(null);
                  setQuestions([]);
                  setActiveWebtoon(null);
                  setQuestionSetTitle('');
                  setQuestionError(null);
                }}
                disabled={metaLoading || !metas.length}
                className="w-full rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {metas.length === 0 ? (
                  <option value="">
                    {metaLoading ? '목록을 불러오는 중...' : '선택 가능한 웹툰이 없습니다'}
                  </option>
                ) : (
                  metas.map((meta) => (
                    <option key={meta.webtoonId} value={meta.webtoonId}>
                      {meta.webtoonName} (문제 {meta.questionCount}개)
                    </option>
                  ))
                )}
              </select>
            </label>
            <button
              onClick={start}
              disabled={disableStartButton}
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold uppercase text-[#2148C0] shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingQuestions
                ? '불러오는 중...'
                : activeWebtoon === selectedWebtoon && questions.length
                  ? '다시 시작'
                  : '시작하기'}
            </button>
          </div>
          {questionError && <p className="mt-3 text-sm text-red-300">{questionError}</p>}
        </section>

        {showIdleStart && !isLoadingQuestions && !questionError && (
          <div className="rounded-2xl border border-white/70 p-8 text-center">
            <p className="text-lg">준비되셨나요?</p>
            <p className="mt-2 text-sm text-white/70">
              웹툰을 선택하고 시작하기 버튼을 눌러주세요.
            </p>
          </div>
        )}

        {step === 'playing' && current && (
          <section className="rounded-2xl border border-white/70 p-6">
            <div className="text-sm text-white/80">
              문제 {idx + 1} / {totalQuestions}
            </div>
            <h2 className="mt-2 text-xl font-semibold">{current.q}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {current.choices.map((c, i) => (
                <li key={i}>
                  <button
                    onClick={() => pick(i)}
                    disabled={chosen !== null}
                    className={[
                      'w-full text-left px-4 py-3 uppercase font-semibold text-[16px] shadow-md rounded',
                      chosen === null
                        ? ''
                        : i === current.answer
                          ? 'ring-2 ring-green-500'
                          : i === chosen
                            ? 'ring-2 ring-red-500 opacity-90'
                            : 'opacity-60',
                    ].join(' ')}
                    style={btnStyle}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {step === 'playing' && chosen !== null && (
          <div className="mt-4 rounded-lg border border-white/50 bg-white/10 p-4">
            {isCorrect ? (
              <p className="font-semibold">✅ 정답입니다!</p>
            ) : (
              <div>
                <p className="font-semibold">❌ 오답입니다.</p>
                <p className="mt-1 text-white/90">
                  정답: <span className="font-bold">{current.choices[current.answer]}</span>
                </p>
              </div>
            )}
            <div className="mt-3">
              <button
                onClick={goNext}
                className="uppercase font-semibold text-[16px] shadow-md px-4 py-2"
                style={btnStyle}
              >
                {idx + 1 >= totalQuestions ? '결과 보기' : '다음 문제'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <section className="rounded-2xl border border-white/70 p-8 text-center">
            <div className="text-lg font-semibold">종료!</div>
            <div className="mt-1">
              점수: {score} / {totalQuestions}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={restart}
                className="uppercase font-semibold text-[16px] shadow-md px-4 py-2"
                style={btnStyle}
              >
                다시 도전
              </button>
              <Link
                href="/genieai/recommendation"
                prefetch
                className="uppercase font-semibold text-[16px] shadow-md px-4 py-2"
                style={btnStyle}
              >
                지니AI의 추천 보러가기
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
