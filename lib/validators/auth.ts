// lib/validators/auth.ts
// yup : 폼 유효성 검증 라이브러리
// zod : 타입 안정성 제공 라이브러리
'use client';

import { z } from 'zod';

// ────────────────────────────────────────────────────────────
// 기본 단일 필드 스키마 (required_error 옵션 대신 체이닝 활용)
// ────────────────────────────────────────────────────────────
// 성별 확인 함수
export const genderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']).optional();
// 아이디 규칙, 에러 함수
export const memberIdSchema = z
  .string() // 옵션 객체 사용 금지
  .min(4, '아이디는 4~20자여야 합니다.')
  .max(20, '아이디는 4~20자여야 합니다.')
  .regex(/^[A-Za-z0-9_]+$/, '아이디는 영문/숫자/_(언더바)만 사용할 수 있습니다.');
/** 비밀번호: 8자 이상, 영문/숫자/특수문자 각각 최소 1개 포함 */
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .refine((v) => /[A-Za-z]/.test(v), '비밀번호에 영문을 포함해주세요.')
  .refine((v) => /\d/.test(v), '비밀번호에 숫자를 포함해주세요.')
  .refine((v) => /[^A-Za-z0-9]/.test(v), '비밀번호에 특수문자를 포함해주세요.');
/** 닉네임: 한글/영문/숫자/공백 2~20자 */
export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 2~20자여야 합니다.')
  .max(20, '닉네임은 2~20자여야 합니다.')
  .regex(/^[\u3131-\uD79D A-Za-z0-9]+$/, '닉네임은 한글, 영문, 숫자, 공백만 사용할 수 있습니다.');
// 이름 규칙, 에러 함수
export const nameSchema = z
  .string()
  .min(2, '이름은 2~50자여야 합니다.')
  .max(50, '이름은 2~50자여야 합니다.');
// 이메일 규칙, 에러 함수
export const emailSchema = z
  .string()
  .trim()
  .min(1, '이메일을 입력해주세요.')
  .regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    '올바른 이메일 형식이 아닙니다. "@"와 "."을 포함해야 합니다.'
  );

// 휴대폰 번호 규칙, 에러 함수
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{3}-\d{3,4}-\d{4}$/, '휴대폰 번호 형식을 확인해주세요.');

// 생년월일 규칙, 에러 함수
export const birthdaySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력해주세요.')
  .optional();

// 주소 규치그 에러 함수
export const addressSchema = z.string().trim().min(1, '주소를 입력하세요').optional();
// ────────────────────────────────────────────────────────────
// 폼 스키마
// ────────────────────────────────────────────────────────────

// 로그인
export const loginSchema = z.object({
  memberId: memberIdSchema,
  password: passwordSchema,
});
export type LoginInput = z.infer<typeof loginSchema>;

// 회원가입
export const signupSchema = z
  .object({
    memberId: memberIdSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    nickname: nicknameSchema,
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    gender: genderEnum,
    birthday: birthdaySchema, // 선택
    address: addressSchema.optional(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '비밀번호가 일치하지 않습니다.',
  });
export type SignupInput = z.infer<typeof signupSchema>;

// 아이디 찾기: 이름 + (이메일 또는 휴대폰) 중 하나는 필수
export const findIdSchema = z
  .object({
    name: z.string().trim().optional(),
    phoneNumber: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      const hasName = !!data.name?.trim();
      const hasPhone = !!data.phoneNumber?.trim();

      // 둘 다 비어있으면 false 반환 (검증 실패)
      if (!hasName && !hasPhone) return false;

      // 하나만 입력된 경우도 false 반환 (검증 실패)
      if ((hasName && !hasPhone) || (!hasName && hasPhone)) return false;

      return true;
    },
    {
      message: '이름과 전화번호를 모두 입력해주세요!',
      path: ['name'], // 에러가 표시될 필드
    }
  )
  .refine(
    (data) => {
      const phoneNumber = data.phoneNumber?.trim();
      if (phoneNumber && !/^\d{3}-?\d{3,4}-?\d{4}$/.test(phoneNumber)) {
        return false;
      }
      return true;
    },
    {
      message: '휴대폰 번호 형식을 확인해주세요.',
      path: ['phoneNumber'],
    }
  )
  .refine(
    (data) => {
      const name = data.name?.trim();
      if (name && (name.length < 2 || name.length > 50)) {
        return false;
      }
      return true;
    },
    {
      message: '이름은 2~50자여야 합니다.',
      path: ['name'],
    }
  );

export type FindIdInput = z.infer<typeof findIdSchema>;

// 비밀번호 찾기: 아이디 + (이메일 또는 휴대폰) 중 하나는 필수
export const findPasswordSchema = z
  .object({
    memberId: memberIdSchema,
    name: emailSchema.optional(),
    phoneNumber: phoneSchema.optional(),
  })
  .refine((v) => !!v.name || !!v.phoneNumber, {
    message: '이메일 또는 휴대폰 중 하나는 반드시 입력해야 합니다.',
    path: ['email'],
  });
export type FindPasswordInput = z.infer<typeof findPasswordSchema>;
