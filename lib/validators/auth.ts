// 로그인/회원가입/아이디·비번찾기 등 “인증 전용 스키마”.
'use client';
import { z } from 'zod';

export const genderEnum = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const memberIdSchema = z
  .string({ required_error: '아이디를 입력해주세요.' })
  .min(4, '아이디는 최소 4자 이상입니다.')
  .max(20, '아이디는 최대 20자입니다.')
  .regex(/^[A-Za-z0-9_]+$/, '영문/숫자/밑줄만 허용됩니다.');

export const passwordSchema = z
  .string({ required_error: '비밀번호를 입력해주세요.' })
  .min(8, '8자리 이상으로 입력하세요.')
  .regex(/[A-Za-z]/, '영문을 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 포함해야 합니다.')
  .regex(/[~`!@#$%^&*()_+\-=[\]{};':",.<>/?]/, '특수문자를 포함해야 합니다.');

export const loginSchema = z.object({
  memberId: memberIdSchema,
  password: passwordSchema,
});

export const signupSchema = z
  .object({
    memberId: memberIdSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
    name: z
      .string({ required_error: '이름을 입력해주세요.' })
      .min(1, '이름을 입력해주세요.')
      .regex(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
    nickname: z
      .string({ required_error: '닉네임을 입력해주세요.' })
      .min(2, '닉네임은 최소 2자입니다.')
      .max(20, '닉네임은 최대 20자입니다.'),
    email: z.string().email('이메일 형식이 올바르지 않습니다.'),
    phoneNumber: z
      .string({ required_error: '전화번호를 입력해주세요.' })
      .regex(/^01[016789]-?[0-9]{3,4}-?[0-9]{4}$/, '전화번호 형식이 올바르지 않습니다.'),
    birth: z
      .string({ required_error: '생년월일을 입력해주세요.' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력해주세요.'),
    address: z.string({ required_error: '주소를 입력해주세요.' }).min(1, '주소를 입력해주세요.'),
    gender: genderEnum.default('OTHER'),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export const findIdSchema = z.object({
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .regex(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
  phoneNumber: z
    .string({ required_error: '전화번호를 입력해주세요.' })
    .regex(/^01[016789]-?[0-9]{3,4}-?[0-9]{4}$/, '전화번호 형식이 올바르지 않습니다.'),
});

export const findPasswordSchema = z.object({
  memberId: memberIdSchema,
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .regex(/^[가-힣]+$/, '이름은 한글만 입력 가능합니다.'),
  phoneNumber: z
    .string({ required_error: '전화번호를 입력해주세요.' })
    .regex(/^01[016789]-?[0-9]{3,4}-?[0-9]{4}$/, '전화번호 형식이 올바르지 않습니다.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type FindIdInput = z.infer<typeof findIdSchema>;
export type FindPasswordInput = z.infer<typeof findPasswordSchema>;
