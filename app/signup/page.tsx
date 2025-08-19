// app/signup/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validators/auth';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<null | boolean>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { gender: 'OTHER' },
  });

  const memberId = watch('memberId');

  // 공통 스타일(피그마 지정값)
  const inputClass =
    'h-[46px] w-full rounded-[4px] bg-transparent px-4 text-white placeholder-white/85 outline-none';
  const inputStyle = useMemo(() => ({ border: '1px solid white' }), []);
  const labelClass = 'mt-1 text-xs text-white/90';

  // ✅ ID 중복 확인
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

  // ✅ 회원가입 (기존 흐름 유지 + 서버 키에 맞춰 매핑)
  const onSubmit = async (raw: SignupInput) => {
    // 생일: 'YYYY/MM/DD'로 들어오면 '-'로 치환 (replaceAll 호환 이슈 방지: 정규식 사용)
    const rawBirth = (raw.birth ?? '').trim();
    const birthDate = rawBirth ? rawBirth.replace(/\//g, '-') : undefined;

    const payload = {
      memberId: raw.memberId.trim(),
      memberPassword: raw.password, // ← 서버 키
      nickname: (raw.nickname ?? raw.name).trim(),
      name: raw.name.trim(),
      birthDate: (raw.birth ?? '').trim().replace(/\//g, '-'), // ← 서버 키
      gender: raw.gender ?? 'OTHER',
      email: raw.email.trim(),
      phoneNumber: raw.phoneNumber.trim(),
      address: raw.address.trim(),
    };

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // ← {...raw}로 보내지 말 것!
    });

    if (res.ok) {
      router.push('/login?joined=1');
    } else {
      const { error } = await res.json().catch(() => ({ error: '회원가입 실패' }));
      alert(error ?? '회원가입 실패');
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: '#929292' }}>
      <main className="mx-auto max-w-[1040px] px-4 py-12">
        {/* 로고 영역 (임시) */}
        <div className="mx-auto mb-10 grid h-[186px] w-[309px] place-content-center rounded bg-black/10 text-white">
          <span className="text-xl font-semibold tracking-wide">GENIE WEBTOON</span>
        </div>

        {/* 폼: 피그마 레이아웃(ID + DOUBLE CHECK 나란히) */}
        <form
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

          {/* NICKNAME (스키마에 존재) */}
          <div className="sm:col-span-12">
            <input
              placeholder="NICKNAME"
              className={inputClass}
              style={inputStyle}
              {...register('nickname')}
            />
            {errors.nickname && <p className={labelClass}>{errors.nickname.message}</p>}
          </div>

          {/* EMAIL */}
          <div className="sm:col-span-12">
            <input
              type="email"
              placeholder="EMAIL"
              className={inputClass}
              style={inputStyle}
              {...register('email')}
            />
            {errors.email && <p className={labelClass}>{errors.email.message}</p>}
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

          {/* BIRTH (YYYY/MM/DD 허용 → 전송 시 하이픈으로 변환) */}
          <div className="sm:col-span-12">
            <input
              placeholder="BIRTH(YYYY-MM-DD)"
              className={inputClass}
              style={inputStyle}
              {...register('birth')}
            />
            {errors.birth && <p className={labelClass}>{errors.birth.message}</p>}
          </div>

          <div className="sm:col-span-12">
            <input
              placeholder="ADDRESS"
              className={inputClass}
              style={inputStyle}
              {...register('address')}
            />
            {errors.address && <p className={labelClass}>{errors.address.message}</p>}
          </div>

          {/* REGISTER 버튼 (가운데 300×46 느낌) */}
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
