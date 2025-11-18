import { fetchArtworks } from '@/lib/server/firebaseAdmin';
import StatsClient from '@/app/stats/StatsClient';

export const revalidate = 120;

export default async function StatsPage() {
  const allArtworks = await fetchArtworks();
  return <StatsClient allArtworks={allArtworks} />;
}
