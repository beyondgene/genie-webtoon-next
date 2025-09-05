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
  .string() // ❌ 옵션 객체 사용 금지
  .min(4, '아이디는 4~20자여야 합니다.')
  .max(20, '아이디는 4~20자여야 합니다.')
  .regex(/^[A-Za-z0-9_]+$/, '아이디는 영문/숫자/_(언더바)만 사용할 수 있습니다.');
// 비밀번호 규칙, 에러 함수
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8~32자여야 합니다.')
  .max(32, '비밀번호는 8~32자여야 합니다.');
// 닉네임 규칙, 에러 함수
export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 2~20자여야 합니다.')
  .max(20, '닉네임은 2~20자여야 합니다.');
// 이름 규칙, 에러 함수
export const nameSchema = z
  .string()
  .min(2, '이름은 2~50자여야 합니다.')
  .max(50, '이름은 2~50자여야 합니다.');
// 이메일 규칙, 에러 함수
export const emailSchema = z.string().email('유효한 이메일 주소를 입력해주세요.');
// 휴대폰 번호 규칙, 에러 함수
export const phoneSchema = z
  .string()
  .regex(/^\d{3}-?\d{3,4}-?\d{4}$/, '휴대폰 번호 형식을 확인해주세요.');

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
    name: nameSchema,
    phoneNumber: phoneSchema.optional(),
  })
  .refine((v) => !!v.phoneNumber, {
    message: '이메일 또는 휴대폰 중 하나는 반드시 입력해야 합니다.',
    path: ['phoneNumber'], // 폼에서 한 곳에 오류 표시되도록 email에 바인딩
  });
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
