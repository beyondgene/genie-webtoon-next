// app/(protected)/(member)/interests/page.tsx
import InterestsClient, { type InterestItem } from './client';
import { getMyInterests } from '@/services/member.service';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return { title: '관심 작가 | 마이페이지' };
}

export default async function Page() {
  const interests = await getMyInterests();
  return <InterestsClient interests={interests as InterestItem[]} />;
}
