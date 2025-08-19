// app/(auth)/layout.tsx — 인증 전용(헤더 없음)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
