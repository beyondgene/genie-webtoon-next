// aria-invalid/aria-describedby 등 접근성 보강
'use client';

import * as React from 'react';
import { FieldError } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  error?: FieldError;
  hintId?: string;
};
// 비밀번호 관련 필드 설정(숨기기,보기,리셋등의 기능처리 컴포넌트)
export default function PasswordField({ label, error, hintId, ...rest }: Props) {
  const [show, setShow] = React.useState(false);
  const describedBy =
    [hintId, error ? `${hintId ?? 'pw'}-error` : undefined].filter(Boolean).join(' ') || undefined;

  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-700">{label}</span>
      <div className="relative">
        <input
          {...rest}
          type={show ? 'text' : 'password'}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
            error ? 'border-red-500' : 'border-zinc-300'
          }`}
        />
        <button
          type="button"
          aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
          onClick={() => setShow((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center"
        >
          {show ? (
            <EyeSlashIcon className="h-5 w-5 text-zinc-500" />
          ) : (
            <EyeIcon className="h-5 w-5 text-zinc-500" />
          )}
        </button>
      </div>
      {error && (
        <span id={`${hintId ?? 'pw'}-error`} className="text-xs text-red-600">
          {error.message}
        </span>
      )}
    </label>
  );
}
