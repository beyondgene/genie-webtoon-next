'use client';

import { useState, useEffect } from 'react';

export default function ProfileForm({ initial }: { initial: any }) {
  const [nickname, setNickname] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('OTHER');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setNickname(initial?.nickname ?? '');
    setName(initial?.name ?? '');
    setAge(initial?.age ?? '');
    setEmail(initial?.email ?? '');
    setPhoneNumber(initial?.phoneNumber ?? '');
    setAddress(initial?.address ?? '');
    setGender(initial?.gender ?? 'OTHER');
  }, [initial]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      return;
    }
    alert('회원정보가 수정되었습니다.');
    location.reload();
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* 닉네임 */}
        <div className="field">
          <span className="field__label">닉네임</span>
          <input
            className="field__input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="" /* placeholder는 숨김 */
          />
        </div>

        {/* 이름 */}
        <div className="field">
          <span className="field__label">이름</span>
          <input className="field__input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* 나이 */}
        <div className="field">
          <span className="field__label">나이</span>
          <input
            type="number"
            className="field__input"
            value={age}
            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
          />
        </div>

        {/* 이메일 */}
        <div className="field">
          <span className="field__label">이메일</span>
          <input
            type="email"
            className="field__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* 휴대폰 */}
        <div className="field sm:col-span-2">
          <span className="field__label">휴대폰</span>
          <input
            className="field__input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {/* 주소 (멀티라인이 필요하면 textarea로) */}
        <div className="field sm:col-span-2">
          <span className="field__label">주소</span>
          <input
            className="field__input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {/* 멀티라인을 원하면:
          <textarea className="field__input field__textarea" rows={2} ... /> */}
        </div>

        {/* 성별 */}
        <div className="field">
          <span className="field__label">성별</span>
          <select
            className="field__input"
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
          <span className="field__label">현재 비밀번호</span>
          <input
            type="password"
            className="field__input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        {/* 새 비밀번호 (선택) */}
        <div className="field sm:col-span-2">
          <span className="field__label">새 비밀번호</span>
          <input
            type="password"
            className="field__input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn-gray h-11 px-6 rounded shadow">
          수정
        </button>
      </div>
    </form>
  );
}
