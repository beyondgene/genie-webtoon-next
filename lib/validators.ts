//  # ID/비번/이메일/생일 등 정규식·zod/yup 스키마
//  전역 공용(예: 공통 문자열/숫자 스키마, 유틸 validator)
// yup : 폼 유효성 검증 라이브러리
// zod : 타입 안정성 제공 라이브러리
/**
 * 입력 검증 스키마 (Yup)
 * - 요구사항 반영:
 *   ID: 한글 불가, 영문/숫자, 4~20자
 *   PW: 8자 이상, 영문+숫자+특수기호
 *   이름: 한글만, 2~20자
 *   이메일: 이메일 형식
 *   생일: YYYY-MM-DD 형식 + 날짜 유효성
 */
import * as yup from 'yup';
// 정규식 regex를 통한 규칙 정의
export const regex = {
  id: /^[A-Za-z0-9]{4,20}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/,
  koreanName: /^[가-힣]{2,20}$/,
  // 010-1234-5678 or 01012345678 둘 다 허용
  phone: /^(01[016789])[-]?\d{3,4}[-]?\d{4}$/,
  birthday: /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
};
// yup을 통한 아이디 에러 정의
export const idSchema = yup
  .string()
  .required('아이디를 입력해주세요.')
  .matches(regex.id, '아이디는 영문/숫자 조합 4~20자여야 합니다.');
// yup을 통한 비밀번호 에러 정의
export const passwordSchema = yup
  .string()
  .required('비밀번호를 입력해주세요.')
  .matches(regex.password, '비밀번호는 8자 이상이며 영문/숫자/특수문자를 모두 포함해야 합니다.');
// yup을 통한 이메일 에러 정의
export const emailSchema = yup
  .string()
  .required('이메일을 입력해주세요.')
  .email('올바른 이메일 형식이 아닙니다.');
// yup을 통한 이름 에러 정의
export const nameSchema = yup
  .string()
  .required('이름을 입력해주세요.')
  .matches(regex.koreanName, '이름은 한글 2~20자여야 합니다.');
// yup을 통한 전화번호 에러 정의
export const phoneSchema = yup
  .string()
  .optional()
  .matches(regex.phone, '휴대폰 번호 형식이 올바르지 않습니다.')
  .nullable();
// yup을 통한 생년월일 에러 정의
export const birthdaySchema = yup
  .string()
  .required('생년월일을 입력해주세요.')
  .matches(regex.birthday, '생년월일은 YYYY-MM-DD 형식이어야 합니다.')
  .test('is-valid-date', '유효한 날짜가 아닙니다.', (value) => {
    if (!value) return false;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  });

// 회원가입 폼 예시 스키마
export const signUpSchema = yup.object({
  memberId: idSchema,
  password: passwordSchema,
  name: nameSchema,
  nickname: yup
    .string()
    .required('닉네임을 입력해주세요.')
    .min(2, '닉네임은 2자 이상입니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.'),
  email: emailSchema,
  phoneNumber: phoneSchema,
  birthday: birthdaySchema,
  gender: yup
    .mixed<'MALE' | 'FEMALE' | 'OTHER'>()
    .oneOf(['MALE', 'FEMALE', 'OTHER'])
    .required('성별을 선택해주세요.'),
});

// 로그인 폼 예시 스키마
export const signInSchema = yup.object({
  memberId: idSchema,
  password: passwordSchema,
});
