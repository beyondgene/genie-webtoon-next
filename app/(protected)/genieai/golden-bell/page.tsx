'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import BackNavigator from '@/components/ui/BackNavigator';

type Quiz = { q: string; choices: string[]; answer: number };
// 도전 골든벨에 나올 문제와 정답을 미리 저장하고 있는 배열
const DEMO_QUIZ: Quiz[] = [
  {
    q: '나 혼자만 레벨업의 주인공 이름은?',
    choices: ['지니', '성진우', '이현수', '강지훈'],
    answer: 1,
  },
  {
    q: '김부장의 주인공은 과거 어떤 직업을 가졌나?',
    choices: ['형사', '특수요원', '정보원', '경호원'],
    answer: 1,
  },
  {
    q: '사신소년에서 소년은 무엇을 대가로 죽은 자의 능력을 빌리나?',
    choices: ['돈', '수명', '기억', '감정'],
    answer: 1,
  },
  {
    q: '재벌집 막내아들에서 윤현우가 깨어난 인물의 이름은?',
    choices: ['진도준', '진서준', '진하준', '진우진'],
    answer: 0,
  },
  {
    q: '백수세끼에서 각 에피소드의 연애 이야기를 잇는 매개는?',
    choices: ['음식 메뉴', '취업 공고', '중고 거래', '여행 일정'],
    answer: 0,
  },
  {
    q: '전지적 독자 시점에서 주인공이 오직 혼자 완주했던 것은?',
    choices: ['드라마 대본', '소설', '만화', '게임'],
    answer: 1,
  },
  {
    q: '방구석 재민이에서 “스펙터클한 사투”가 벌어지는 장소는?',
    choices: ['방구석', '학교 운동장', '회사 회의실', '지하철'],
    answer: 0,
  },
  {
    q: '귀혼에서 천령이 가진 특별한 능력은?',
    choices: ['영안', '순간이동', '투명화', '치유'],
    answer: 0,
  },
  {
    q: '레베카의 기도에서 레베카가 훔친 것은?',
    choices: ['상속녀의 운명', '왕실 보석', '비밀 요리법', '발명 특허'],
    answer: 0,
  },
  { q: '위닝샷!에서 안시윤의 포지션은?', choices: ['타자', '포수', '투수', '외야수'], answer: 2 },
  {
    q: '사변괴담에서 영남 가족이 피난 간 곳은?',
    choices: ['이웃집', '숙부의 집', '군부대', '학교 체육관'],
    answer: 1,
  },
];
// 버튼 스타일 디자인
const btnStyle: React.CSSProperties = {
  background: 'white',
  color: '#2148C0',
  boxShadow: '0px 4px 4px rgba(0,0,0,0.30)',
  borderRadius: 4,
};
// 도전 골든벨 페이지
export default function GoldenBellPage() {
  const [step, setStep] = useState<'idle' | 'playing' | 'done'>('idle');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const current = useMemo(() => DEMO_QUIZ[idx], [idx]);
  // 시작 버튼 로직
  const start = () => {
    setScore(0);
    setIdx(0);
    setStep('playing');
    setChosen(null);
    setIsCorrect(null);
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
    if (idx + 1 >= DEMO_QUIZ.length) {
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
          </div>
        </header>

        {step === 'idle' && (
          <div className="rounded-2xl border border-white/70 p-8 text-center">
            <p className="text-lg">준비되셨나요?</p>
            <button
              onClick={start}
              className="mt-4 uppercase font-semibold text-[16px] shadow-md px-5 py-2"
              style={btnStyle}
            >
              시작하기
            </button>
          </div>
        )}

        {step === 'playing' && current && (
          <section className="rounded-2xl border border-white/70 p-6">
            <div className="text-sm text-white/80">
              문제 {idx + 1} / {DEMO_QUIZ.length}
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
                {idx + 1 >= DEMO_QUIZ.length ? '결과 보기' : '다음 문제'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <section className="rounded-2xl border border-white/70 p-8 text-center">
            <div className="text-lg font-semibold">종료!</div>
            <div className="mt-1">
              점수: {score} / {DEMO_QUIZ.length}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={start}
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
