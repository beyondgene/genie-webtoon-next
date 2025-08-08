import nodemailer from 'nodemailer';

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, NEXTAUTH_URL } = process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM || !NEXTAUTH_URL) {
  throw new Error('Missing required email environment variables');
}

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: Number(EMAIL_PORT),
  secure: Number(EMAIL_PORT) === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export function verificationEmailTemplate(verifyUrl: string): string {
  return `
      <h1>이메일 인증</h1>
      <p>아래 버튼을 눌러 이메일 인증을 완료하세요.</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:10px 20px;background-color:#346df1;color:#fff;text-decoration:none;border-radius:4px;">이메일 인증하기</a>
      <p>버튼이 동작하지 않으면 아래 URL을 복사하여 붙여넣으세요:</p>
      <p>${verifyUrl}</p>
    `;
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  const mailOptions: MailOptions = {
    to,
    subject: '[Genie Webtoon] 이메일 인증을 완료해주세요',
    html: verificationEmailTemplate(verifyUrl),
  };

  try {
    await transporter.sendMail({ from: EMAIL_FROM, ...mailOptions });
  } catch (err: any) {
    console.error('[Email Error] Verification email failed:', err);
    throw new Error('Failed to send verification email');
  }
}

export async function sendResetLinkEmail(to: string, token: string) {
  const resetUrl = `${NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const mailOptions: MailOptions = {
    to,
    subject: '[Genie Webtoon] 비밀번호 재설정 링크입니다',
    html: `
      <h1>비밀번호 재설정</h1>
      <p>아래 버튼을 눌러 비밀번호 재설정을 진행해주세요.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#346df1;color:#fff;text-decoration:none;border-radius:4px;">비밀번호 재설정하기</a>
      <p>버튼이 동작하지 않으면 아래 URL을 복사하여 붙여넣으세요:</p>
      <p>${resetUrl}</p>
    `,
  };

  try {
    await transporter.sendMail({ from: EMAIL_FROM, ...mailOptions });
  } catch (err: any) {
    console.error('[Email Error] Reset link email failed:', err);
    throw new Error('Failed to send reset link email');
  }
}

export async function sendResetPasswordEmail(to: string, tempPassword: string) {
  const html = `
    <h1>임시 비밀번호 안내</h1>
    <p>발급된 임시 비밀번호: <strong>${tempPassword}</strong></p>
    <p>로그인 후 반드시 비밀번호를 변경해주세요.</p>
  `;

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject: '[Genie Webtoon] 임시 비밀번호가 발급되었습니다',
      html,
    });
  } catch (err: any) {
    console.error('[Email Error] Reset password email failed:', err);
    throw new Error('Failed to send reset password email');
  }
}
