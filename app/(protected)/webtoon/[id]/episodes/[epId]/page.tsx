import EpisodeViewer from '@/components/viewer/EpisodeViewer';
import { headers, cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getBaseUrl() {
  const env = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
  if (env) return env.replace(/\/$/, '');
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}
async function getCookieHeader() {
  const c = await cookies();
  return c
    .getAll()
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ');
}

/** 다양한 응답 포맷을 흡수해서 "Episode row"만 꺼낸다 */
function extractEpisode(json: any) {
  return json?.data?.episode ?? json?.episode ?? json?.data ?? json ?? null;
}
/** 다양한 응답 포맷을 흡수해서 "에피소드 배열"만 꺼낸다 */
function extractEpisodes(json: any) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.episodes)) return json.episodes;
  return [];
}

export default async function Page(props: { params: Promise<{ id: string; epId: string }> }) {
  const { id, epId } = await props.params;
  const webtoonId = Number(id);
  const episodeId = Number(epId);

  const base = await getBaseUrl();
  const cookie = await getCookieHeader();

  const [episodeRes, listRes, adRes] = await Promise.all([
    fetch(`${base}/api/episode/${webtoonId}/${episodeId}`, {
      cache: 'no-store',
      headers: { cookie },
    }),
    fetch(`${base}/api/episode/${webtoonId}?limit=500`, { cache: 'no-store', headers: { cookie } }),
    fetch(
      `${base}/api/advertisement/episode-bottom?webtoonId=${webtoonId}&episodeId=${episodeId}`,
      { cache: 'no-store' }
    ),
  ]);

  const [episodeJson, listJson, adJson] = await Promise.all([
    episodeRes.ok ? episodeRes.json().catch(() => null) : null,
    listRes.ok ? listRes.json().catch(() => null) : null,
    adRes.ok ? adRes.json().catch(() => null) : null,
  ]);

  const episode = extractEpisode(episodeJson);
  const episodes = extractEpisodes(listJson);
  const ad = adJson?.data ?? adJson ?? null;

  return (
    <EpisodeViewer
      webtoonId={webtoonId}
      episodeId={episodeId}
      episode={episode}
      episodes={episodes}
      ad={ad}
    />
  );
}
