import { fetchArtworks } from '@/lib/server/firebaseAdmin';
import HomeClient from './HomeClient';

export const revalidate = 60; // revalidate static data periodically

export default async function HomePage() {
  const artworks = await fetchArtworks();
  return <HomeClient artworks={artworks} />;
}
