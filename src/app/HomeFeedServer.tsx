import { unstable_cache } from 'next/cache';
import { fetchArtworksServer } from '@/lib/server/firebaseAdmin';
import HomeFeedClient from './HomeFeedClient';
import { Suspense } from 'react';

export const revalidate = 60;

// Server component: fetches all artworks and passes to client for rendering, with filter and infinite scroll props
export default async function HomeFeedServer({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // Parse filters from searchParams (URL)
  const medium = typeof searchParams?.medium === 'string' ? searchParams.medium : 'all';
  const year = typeof searchParams?.year === 'string' ? searchParams.year : 'all';
  const evaluation = typeof searchParams?.evaluation === 'string' ? searchParams.evaluation : 'all';
  const rating = typeof searchParams?.rating === 'string' ? searchParams.rating : 'all';
  const q = typeof searchParams?.q === 'string' ? searchParams.q : '';

  // Fetch all artworks (cached)
  const getArtworks = unstable_cache(async () => fetchArtworksServer(), ['artworks'], { revalidate: 60 });
  const allArtworks = await getArtworks();

  // Pass all data and filters to client component
  return (
    <Suspense fallback={<div>Loading feed...</div>}>
      <HomeFeedClient
        allArtworks={allArtworks}
        initialFilters={{ medium, year, evaluation, rating, q }}
      />
    </Suspense>
  );
}
