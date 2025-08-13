// app/(member)/my/profile/profile.form.tsx
// TextField/PasswordField 사용(접근성 + Heroicons). 반응형 1→2열.
'use client';

import { useForm } from 'react-hook-form';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import TextField from '@/components/forms/TextField';
import PasswordField from '@/components/forms/PasswordField';
import { updateProfile, type UpdateProfilePayload } from '@/services/member.service';

export default function ProfileForm({ initial }: { initial: any }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateProfilePayload>({
    defaultValues: {
      nickname: initial?.nickname ?? '',
      email: initial?.email ?? '',
      phoneNumber: initial?.phoneNumber ?? '',
      address: initial?.address ?? '',
    },
  });
  const newPassword = watch('newPassword');
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit((data) =>
        start(async () => {
          await updateProfile(data);
          router.refresh();
          alert('프로필이 수정되었습니다.');
        })
      )}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          label="닉네임"
          {...register('nickname', { required: '필수 입력' })}
          error={errors.nickname}
        />
        <TextField label="이메일" type="email" {...register('email')} error={errors.email as any} />
        <TextField
          label="전화번호"
          {...register('phoneNumber')}
          error={errors.phoneNumber as any}
        />
        <TextField label="주소" {...register('address')} error={errors.address as any} />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-zinc-700">비밀번호 변경(선택)</legend>
        <PasswordField
          label="현재 비밀번호"
          placeholder="현재 비밀번호"
          {...register('currentPassword')}
        />
        <PasswordField label="새 비밀번호" placeholder="새 비밀번호" {...register('newPassword')} />
        {newPassword ? (
          <PasswordField
            label="새 비밀번호 확인"
            placeholder="새 비밀번호 확인"
            {...(register as any)('confirm', {
              validate: (v: string) => v === newPassword || '비밀번호가 일치하지 않습니다.',
            })}
          />
        ) : null}
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          저장
        </button>
      </div>
    </form>
  );
}
