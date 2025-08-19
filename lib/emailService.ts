// lib/emailService.ts
// 멀티 프로바이더(Gmail/Naver) + 폴백 + 개발 중 무환경 스킵
// 컨트롤러/라우트의 기존 호출부(함수명/시그니처) 유지

type Provider = 'gmail' | 'naver' | 'legacy';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const { NEXTAUTH_URL, EMAIL_PRIMARY, REPLY_TO } = process.env;

// -------------------- config helpers --------------------
function readCfg(p: Provider) {
  // 기존 단일 설정(legacy: EMAIL_*)도 호환
  if (p === 'legacy') {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT ?? 0);
    const secure = (process.env.EMAIL_SECURE ?? (port === 465 ? 'true' : 'false')) === 'true';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const from = process.env.EMAIL_FROM;
    return { host, port, secure, user, pass, from };
  }

  const P = p.toUpperCase();
  const host =
    process.env[`${P}_HOST`] ||
    (p === 'gmail' ? 'smtp.gmail.com' : p === 'naver' ? 'smtp.naver.com' : undefined);
  const port = Number(process.env[`${P}_PORT`] ?? 465);
  const secure = (process.env[`${P}_SECURE`] ?? (port === 465 ? 'true' : 'false')) === 'true';
  const user = process.env[`${P}_USER`];
  const pass = process.env[`${P}_PASS`];
  const from = process.env[`${P}_FROM`];
  return { host, port, secure, user, pass, from };
}

function isCfgReady(p: Provider) {
  const c = readCfg(p);
  return Boolean(c.host && c.port && c.user && c.pass && c.from);
}

async function mkTransport(p: Provider) {
  const cfg = readCfg(p);
  // 동적 import: Next.js/Edge 환경 충돌 방지
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  } as any);
  return { transporter, from: cfg.from! };
}

function providerOrder(explicit?: Provider): Provider[] {
  // 우선순위: 명시 → EMAIL_PRIMARY → gmail → naver → legacy
  const primary = explicit || (EMAIL_PRIMARY as Provider) || 'gmail';
  const fallbacks: Provider[] =
    primary === 'gmail'
      ? ['naver', 'legacy']
      : primary === 'naver'
        ? ['gmail', 'legacy']
        : ['gmail', 'naver'];
  return Array.from(new Set<Provider>([primary, ...fallbacks]));
}

export function isEmailConfigured() {
  return isCfgReady('gmail') || isCfgReady('naver') || isCfgReady('legacy');
}

// -------------------- core sender --------------------
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  opts?: { provider?: Provider; replyTo?: string }
) {
  // 개발 단계: 미설정이면 크래시 대신 스킵
  if (!isEmailConfigured()) {
    console.warn('[email] not configured, skip sending');
    return { ok: false as const, skipped: true as const };
  }

  const order = providerOrder(opts?.provider);
  for (const p of order) {
    if (!isCfgReady(p)) continue;
    try {
      const { transporter, from } = await mkTransport(p);
      const info = await transporter.sendMail({
        from,
        to, // ← 수신자는 폼 값
        subject,
        html,
        replyTo: opts?.replyTo ?? REPLY_TO ?? from,
      });
      return { ok: true as const, provider: p, messageId: (info as any)?.messageId };
    } catch (e: any) {
      console.warn(`[email] ${p} failed:`, e?.message ?? e);
      // 다음 프로바이더로 폴백
    }
  }

  console.warn('[email] all providers failed or not ready');
  return { ok: false as const, failed: true as const };
}

// -------------------- templates --------------------
export function verificationEmailTemplate(verifyUrl: string): string {
  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
      <h2>이메일 인증</h2>
      <p>아래 버튼을 눌러 이메일 인증을 완료하세요.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#2148C0;color:#fff;text-decoration:none">이메일 인증하기</a></p>
      <p style="color:#666">버튼이 동작하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:</p>
      <p>${verifyUrl}</p>
    </div>
  `.trim();
}

// -------------------- public APIs (호출부 유지) --------------------

// 오버로드 지원:
// 1) sendVerificationEmail(to, token) → 기본 템플릿/NEXTAUTH_URL 사용
// 2) sendVerificationEmail(to, subject, html) → 직접 컨텐츠 지정
export async function sendVerificationEmail(to: string, token: string): Promise<void>;
export async function sendVerificationEmail(
  to: string,
  subject: string,
  html: string
): Promise<void>;
export async function sendVerificationEmail(to: string, a: string, b?: string): Promise<void> {
  // (2) subject/html 직접 전달
  if (typeof b === 'string') {
    const res = await sendEmail(to, a, b);
    if (!res.ok && !('skipped' in res)) throw new Error('Failed to send verification email');
    return;
  }

  // (1) token 전달 → 기본 템플릿
  const base = (NEXTAUTH_URL || '').replace(/\/+$/, '');
  const verifyUrl = `${base}/auth/verify-email?token=${encodeURIComponent(a)}`;
  const subject = '[Genie Webtoon] 이메일 인증을 완료해주세요';
  const html = verificationEmailTemplate(verifyUrl);

  const res = await sendEmail(to, subject, html);
  if (!res.ok && !('skipped' in res)) throw new Error('Failed to send verification email');
}

export async function sendResetLinkEmail(to: string, token: string) {
  const base = (NEXTAUTH_URL || '').replace(/\/+$/, '');
  const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;

  const mail: MailOptions = {
    to,
    subject: '[Genie Webtoon] 비밀번호 재설정 링크입니다',
    html: `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
        <h2>비밀번호 재설정</h2>
        <p>아래 버튼을 눌러 비밀번호 재설정을 진행해주세요.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#2148C0;color:#fff;text-decoration:none">비밀번호 재설정하기</a></p>
        <p style="color:#666">버튼이 동작하지 않으면 아래 URL을 복사하여 브라우저에 붙여넣으세요:</p>
        <p>${resetUrl}</p>
      </div>
    `.trim(),
  };

  const res = await sendEmail(mail.to, mail.subject, mail.html);
  if (!res.ok && !('skipped' in res)) throw new Error('Failed to send reset link email');
}

export async function sendResetPasswordEmail(to: string, tempPassword: string) {
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
      <h2>임시 비밀번호 안내</h2>
      <p>발급된 임시 비밀번호: <strong>${tempPassword}</strong></p>
      <p>로그인 후 반드시 비밀번호를 변경해주세요.</p>
    </div>
  `.trim();

  const res = await sendEmail(to, '[Genie Webtoon] 임시 비밀번호가 발급되었습니다', html);
  if (!res.ok && !('skipped' in res)) throw new Error('Failed to send reset password email');
}
