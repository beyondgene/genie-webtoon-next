'use client';

import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function SocialLoginButtons() {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => signIn('kakao', { callbackUrl: '/' })}
        className="w-full"
        aria-label="카카오로 로그인"
      >
        <Image
          src="/auth/kakao_login.png"
          alt="카카오 로그인"
          width={360}
          height={48}
          className="w-full h-auto"
          priority
        />
      </button>

      <button
        type="button"
        onClick={() => signIn('naver', { callbackUrl: '/' })}
        className="w-full"
        aria-label="네이버로 로그인"
      >
        <Image
          src="/auth/naver_login.png"
          alt="네이버 로그인"
          width={360}
          height={48}
          className="w-full h-auto"
        />
      </button>
    </div>
  );
}
