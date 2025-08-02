import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

// 환경변수 필요: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, NEXTAUTH_URL
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: Number(process.env.EMAIL_PORT!),
  secure: Number(process.env.EMAIL_PORT!) === 465, // 465 포트면 TLS
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

/**
 * 인증 이메일을 전송합니다.
 * @param to 수신자 이메일 주소
 * @param token 회원 가입 시 생성된 verificationToken
 */
export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const mailOptions: MailOptions = {
    to,
    subject: '[Genie Webtoon] 이메일 인증을 완료해주세요',
    html: `
      <h1>Genie Webtoon 이메일 인증</h1>
      <p>아래 버튼을 눌러 이메일 인증을 완료하세요.</p>
      <a href="${verifyUrl}" style="
        display:inline-block;padding:10px 20px;
        background-color:#346df1;color:#fff;
        text-decoration:none;border-radius:4px;
      ">이메일 인증하기</a>
      <p>위 버튼이 동작하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:</p>
      <p>${verifyUrl}</p>
    `,
  };

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    ...mailOptions,
  });
}

export async function sendResetPasswordEmail(to: string, tempPassword: string) {
  const html = `
    <h1>Genie Webtoon 임시 비밀번호 안내</h1>
    <p>발급된 임시 비밀번호: <strong>${tempPassword}</strong></p>
    <p>로그인 후 반드시 비밀번호를 변경해주세요.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: '[지니웹툰] 임시 비밀번호가 발급되었습니다',
    html,
  });
}