import { fetchArtworks } from '@/lib/server/firebaseAdmin';
import AdminClient from './AdminClient';

export const revalidate = 60;

export default async function AdminPage() {
  const artworks = await fetchArtworks();
  return <AdminClient artworks={artworks} />;
}