'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getSession, signOut } from 'next-auth/react';

const missingPasswordCategories = (value: string) => {
  if (!value) return [] as string[];
  const missing: string[] = [];
  if (!/[A-Za-z]/.test(value)) missing.push('영문');
  if (!/\d/.test(value)) missing.push('숫자');
  if (!/[^A-Za-z0-9]/.test(value)) missing.push('특수문자');
  return missing;
};

// 프로필 형태 정의
// initial을 선택적으로 받도록 변경
type ProfileFormInput = Partial<{
  nickname: string;
  name: string;
  age: string | number;
  email: string;
  phoneNumber: string;
  address: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}>;

type ProfileFormProps = {
  initial?: ProfileFormInput; // optional
};

export default function ProfileForm({ initial }: ProfileFormProps) {
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('OTHER');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentPwMissing = useMemo(
    () => missingPasswordCategories(currentPassword ?? ''),
    [currentPassword]
  );
  const newPwMissing = useMemo(() => missingPasswordCategories(newPassword ?? ''), [newPassword]);

  // 최초 로딩된 값 스냅샷을 저장해 두고, 이후 변경 여부를 판별
  const originalRef = useRef<ProfileFormInput | null>(null);

  const snapshot = (src: ProfileFormInput) => ({
    nickname: (src.nickname ?? '').trim(),
    name: (src.name ?? '').trim(),
    age: src.age === '' ? '' : Number(src.age as any),
    email: (src.email ?? '').trim(),
    phoneNumber: (src.phoneNumber ?? '').trim(),
    address: (src.address ?? '').trim(),
    gender: src.gender ?? 'OTHER',
  });

  const isSame = (a: ProfileFormInput | null, b: ProfileFormInput | null) => {
    if (!a || !b) return false;
    const A = snapshot(a);
    const B = snapshot(b);
    return (
      A.nickname === B.nickname &&
      A.name === B.name &&
      A.age === B.age &&
      A.email === B.email &&
      A.phoneNumber === B.phoneNumber &&
      A.address === B.address &&
      A.gender === B.gender
    );
  };
  // any/string/number 등을 number | '' 로 정규화
  const toAgeState = (v: unknown): number | '' => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : '';
  };

  // 회원탈퇴 관련 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 회원탈퇴시 세션 체크 및 강제 로그아웃 처리
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const session = await getSession();
      if (!active) return;
      const status = (session?.user as any)?.status;
      if (!session || status !== 'ACTIVE') {
        window.location.replace('/login');
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        void checkSession();
      }
    };

    const handlePopState = () => {
      window.location.replace('/login');
    };

    void checkSession();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('popstate', handlePopState);

    return () => {
      active = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 회원가입시 db에 저장된 정보 불러오기
  useEffect(() => {
    // 서버가 initial을 안 주면(=CSR 모드) 직접 프로필 GET
    if (!initial) {
      (async () => {
        const r = await fetch('/api/member/profile', { cache: 'no-store' });
        const d = await r.json().catch(() => ({}));
        const me = d?.data ?? d ?? {};
        const base: ProfileFormInput = {
          nickname: me.nickname ?? '',
          name: me.name ?? '',
          age: toAgeState(me.age),
          email: me.email ?? '',
          phoneNumber: me.phoneNumber ?? '',
          address: me.address ?? '',
          gender: me.gender ?? 'OTHER',
        };
        originalRef.current = base;
        setNickname(base.nickname ?? '');
        setName(base.name ?? '');
        setAge(toAgeState(base.age));
        setEmail(base.email ?? '');
        setPhoneNumber(base.phoneNumber ?? '');
        setAddress(base.address ?? '');
        setGender(base.gender ?? 'OTHER');
      })();
      return;
    }
    // 서버가 initial 제공 시(SSR 경로) 그대로 세팅
    const base: ProfileFormInput = {
      nickname: initial?.nickname ?? '',
      name: initial?.name ?? '',
      age: toAgeState(initial?.age),
      email: initial?.email ?? '',
      phoneNumber: initial?.phoneNumber ?? '',
      address: initial?.address ?? '',
      gender: initial?.gender ?? 'OTHER',
    };
    originalRef.current = base;
    setNickname(base.nickname ?? '');
    setName(base.name ?? '');
    setAge(toAgeState(base.age));
    setEmail(base.email ?? '');
    setPhoneNumber(base.phoneNumber ?? '');
    setAddress(base.address ?? '');
    setGender(base.gender ?? 'OTHER');
  }, [initial]);

  // 변경 여부(프로필 값 또는 비밀번호 변경 입력)가 있을 때만 활성화
  const isProfileDirty = useMemo(() => {
    const current: ProfileFormInput = {
      nickname,
      name,
      age,
      email,
      phoneNumber,
      address,
      gender,
    };
    const base = originalRef.current;
    if (!base) return false;
    return !isSame(current, base);
  }, [nickname, name, age, email, phoneNumber, address, gender]);

  const isPasswordDirty = currentPassword.trim().length > 0 || newPassword.trim().length > 0;
  const isDirty = isProfileDirty || isPasswordDirty;

  // 수정 버튼 누를때 값들 push
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty || isSubmitting) return;
    setIsSubmitting(true);
    const payload: any = {
      nickname,
      name,
      age: age === '' ? undefined : Number(age),
      email,
      phoneNumber,
      address,
      gender,
    };
    if (currentPassword || newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const res = await fetch('/api/member/profile/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.error || data?.message || res.statusText || '수정 실패');
      setIsSubmitting(false);
      return;
    }
    alert('회원정보가 수정되었습니다.');
    location.reload();
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      alert('현재 비밀번호를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch('/api/member/profile/update', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: deletePassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data?.error || data?.message || res.statusText || '탈퇴 처리 실패');
        return;
      }

      alert('회원탈퇴가 완료되었습니다.');
      // 세션 종료 후 로그인 페이지로 교체 이동
      await signOut({ redirect: false });
      window.location.replace('/login');
    } catch (error) {
      alert('탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeletePassword('');
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 닉네임 */}
          <div className="field">
            <span className="field__label text-white">닉네임</span>
            <input
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="" /* placeholder는 숨김 */
            />
          </div>

          {/* 이름 */}
          <div className="field">
            <span className="field__label text-white">이름</span>
            <input
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 나이 */}
          <div className="field">
            <span className="field__label text-white">나이</span>
            <input
              type="number"
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={age}
              onChange={(e) => setAge(toAgeState(e.target.value))}
            />
          </div>

          {/* 이메일 */}
          <div className="field">
            <span className="field__label text-white">이메일</span>
            <input
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 휴대폰 */}
          <div className="field sm:col-span-2">
            <span className="field__label text-white">휴대폰</span>
            <input
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          {/* 주소 (멀티라인이 필요하면 textarea로) */}
          <div className="field sm:col-span-2">
            <span className="field__label text-white">주소</span>
            <input
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {/* 멀티라인을 원하면:
            <textarea className="field__input field__textarea" rows={2} ... /> */}
          </div>

          {/* 성별 */}
          <div className="field">
            <span className="field__label text-white">성별</span>
            <select
              className="field__input text-white bg-[#4f4f4f] border border-white"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
            >
              <option value="MALE">남</option>
              <option value="FEMALE">여</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          {/* 현재 비밀번호 (선택) */}
          <div className="field">
            <span className="field__label text-white">현재 비밀번호</span>
            <input
              type="password"
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          {/* 새 비밀번호 (선택) */}
          <div className="field sm:col-span-2 relative">
            <span className="field__label text-white">새 비밀번호</span>
            <input
              type="password"
              className="field__input text-white placeholder-white/70 caret-white bg-[#4f4f4f] border border-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword && newPwMissing.length > 0 && (
              <p className="absolute -bottom-5 left-0 text-xs text-white z-10">
                비밀번호에 {newPwMissing.join(', ')}을(를) 포함해주세요.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center pt-6">
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            aria-disabled={!isDirty || isSubmitting}
            className="btn-gray h-11 px-8 rounded shadow text-white border border-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            수정
          </button>
        </div>
      </form>

      {/* 회원탈퇴 버튼: 프로필 영역 밖(배경) 중앙 하단 고정 */}
      <div className="mt-6 flex justify-center sm:mt-0">
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="w-full max-w-xs px-6 py-3 rounded shadow bg-[#4f4f4f] text-[#929292] text-sm font-medium hover:bg-[#4f4f4f]/90 transition-colors border border-[#929292] sm:fixed sm:bottom-6 sm:left-1/2 sm:w-auto sm:-translate-x-1/2 sm:z-40"
        >
          회원탈퇴
        </button>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">정말로 탈퇴하시겠습니까?</h3>

            <p className="text-sm text-gray-600 mb-6">
              탈퇴하시면 모든 개인정보와 구독 정보가 삭제되며, 복구할 수 없습니다.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                현재 비밀번호를 입력해주세요
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="현재 비밀번호"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting || !deletePassword.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? '처리중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
