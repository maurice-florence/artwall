
import { unstable_cache } from 'next/cache';
import { fetchArtworks } from '@/lib/server/firebaseAdmin';
import HomeFeedClient from './HomeFeedClient';
import { Suspense } from 'react';

export const revalidate = 60;

// Server component: fetches all artworks and passes to client for rendering, with filter and infinite scroll props

export default async function HomeFeedServer({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // Next.js 15: Only call .get() on awaited searchParams, never on the original
  let medium = 'all', year = 'all', evaluation = 'all', rating = 'all', q = '';
  let params = searchParams;
  // Only check .get after awaiting, never before
  if (params && typeof params === 'object' && typeof (params as any).then === 'function') {
    // Await if it's a promise-like (dynamic API)
    params = await params;
  }
  if (params && typeof (params as any).get === 'function') {
    // Now safe to use .get
    medium = params.get('medium') || 'all';
    year = params.get('year') || 'all';
    evaluation = params.get('evaluation') || 'all';
    rating = params.get('rating') || 'all';
    q = params.get('q') || '';
  } else if (params && Object.prototype.toString.call(params) === '[object Object]') {
    const p = params as Record<string, string | string[] | undefined>;
    medium = typeof p.medium === 'string' ? p.medium : 'all';
    year = typeof p.year === 'string' ? p.year : 'all';
    evaluation = typeof p.evaluation === 'string' ? p.evaluation : 'all';
    rating = typeof p.rating === 'string' ? p.rating : 'all';
    q = typeof p.q === 'string' ? p.q : '';
  }

  // Fetch all artworks (cached)
  const getArtworks = unstable_cache(async () => fetchArtworks(), ['artworks'], { revalidate: 60 });
  const allArtworks = await getArtworks();

  return (
    <Suspense fallback={<div>Loading feed...</div>}>
      <HomeFeedClient
        allArtworks={allArtworks}
        initialFilters={{ medium, year, evaluation, rating, q }}
      />
    </Suspense>
  );
}
