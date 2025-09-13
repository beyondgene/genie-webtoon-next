// app/(auth)/verify-email/page.tsx
// 이 파일은 Server Component입니다.
// 핵심 아이디어: 페이지 레벨에서는 useSearchParams 같은 클라이언트 훅을 쓰지 않고
// 서버가 제공하는 searchParams 인자를 이용해 쿼리(token)를 안전히 파싱한 뒤
// 클라이언트 하위 컴포넌트로 전달합니다. (CSR bail-out / Suspense 요구 회피)

import VerifyEmailClient from './Client';

export const dynamic = 'force-dynamic';
export const preferredRegion = ['icn1', 'hnd1'];
// ↑ (선택) 정적 프리렌더를 강제하지 않고 매 요청/빌드 시점에서 동작하도록 설정.
//    인증 토큰 검증 페이지 특성상 캐싱을 원치 않으면 유지하세요. 필요 없으면 제거해도 무방합니다.

// searchParams의 타입: Next 15 App Router에서 page는 아래 시그니처를 가질 수 있습니다.
// - searchParams는 Promise 형태로 전달되므로 await가 필요합니다.
type Search = Record<string, string | string[] | undefined>;

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  // Next 15: searchParams는 Promise이므로 반드시 await
  const sp = await searchParams;

  // token 쿼리 추출 (배열/undefined 케이스까지 방어적으로 처리)
  const tokenParam = sp.token;
  const token = Array.isArray(tokenParam) ? (tokenParam[0] ?? '') : (tokenParam ?? '');

  // 페이지 레벨에선 훅을 쓰지 않고, 클라이언트 컴포넌트에 prop으로 내려줍니다.
  // 이렇게 하면 "useSearchParams() should be wrapped in a suspense boundary" 에러를 피할 수 있습니다.
  return <VerifyEmailClient token={token} />;
}
