// app/genieai/golden-bell/page.tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Quiz = {
  q: string;
  choices: string[];
  answer: number; // index
};

const DEMO_QUIZ: Quiz[] = [
  {
    q: '웹툰 회차를 스크롤로 감상하는 기본 UX는?',
    choices: ['컷툰', '스크롤뷰', '더빙뷰', '슬라이드뷰'],
    answer: 1,
  },
  {
    q: 'Genie Webtoon의 차별점으로 기획된 보조 기능은?',
    choices: ['선결제 미리보기', '유료 전환', 'AI 추천 & 골든벨', '후원 전용'],
    answer: 2,
  },
];

export default function GoldenBellPage() {
  const [step, setStep] = useState<'idle' | 'playing' | 'done'>('idle');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);

  const current = useMemo(() => DEMO_QUIZ[idx], [idx]);

  const start = () => {
    setScore(0);
    setIdx(0);
    setStep('playing');
  };

  const pick = (i: number) => {
    if (current?.answer === i) setScore((s) => s + 1);
    if (idx + 1 >= DEMO_QUIZ.length) setStep('done');
    else setIdx((i) => i + 1);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">도전! 골든벨</h1>
          <p className="mt-1 text-sm text-zinc-500">
            웹툰 퀴즈를 풀고 1등에 도전하세요. (플레이스홀더 UI)
          </p>
        </div>
        <Link
          href="/feed"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
          prefetch
        >
          내 피드
        </Link>
      </header>

      {step === 'idle' && (
        <div className="rounded-2xl border p-8 text-center">
          <p className="text-lg">준비되셨나요?</p>
          <button
            onClick={start}
            className="mt-4 rounded-xl bg-black px-5 py-2 text-sm text-white hover:opacity-90"
          >
            시작하기
          </button>
        </div>
      )}

      {step === 'playing' && current && (
        <section className="rounded-2xl border p-6">
          <div className="text-sm text-zinc-500">
            문제 {idx + 1} / {DEMO_QUIZ.length}
          </div>
          <h2 className="mt-2 text-xl font-semibold">{current.q}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {current.choices.map((c, i) => (
              <li key={i}>
                <button
                  onClick={() => pick(i)}
                  className="w-full rounded-xl border px-4 py-3 text-left hover:bg-zinc-50"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 'done' && (
        <section className="rounded-2xl border p-8 text-center">
          <div className="text-lg font-semibold">종료!</div>
          <div className="mt-1 text-zinc-600">
            점수: {score} / {DEMO_QUIZ.length}
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={start}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
            >
              다시 도전
            </button>
            <Link
              href="/genieai/recommendation"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
              prefetch
            >
              추천 보러가기
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
