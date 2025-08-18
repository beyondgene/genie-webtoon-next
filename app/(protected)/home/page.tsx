// app/(protected)/home/page.tsx
import ExpandingGrid from '@/components/home/ExpandingGrid';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <ExpandingGrid />;
}
