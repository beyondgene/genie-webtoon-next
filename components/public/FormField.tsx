'use client';
import { FieldError } from 'react-hook-form';
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: FieldError;
};
export default function FormField({ label, error, ...rest }: Props) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-zinc-700">{label}</span>
      <input
        {...rest}
        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
          error ? 'border-red-500' : 'border-zinc-300'
        }`}
      />
      {error && <span className="text-xs text-red-600">{error.message}</span>}
    </label>
  );
}
