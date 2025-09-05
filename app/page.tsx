// app/page.tsx
import { redirect } from 'next/navigation';
// 로그인 페이지가 첫화면이므로 리디렉션
export default function Root() {
  redirect('/login');
}
