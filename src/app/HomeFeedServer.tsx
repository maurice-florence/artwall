
import { Suspense } from 'react';
import { fetchArtworks } from '@/lib/server/firebaseAdmin';
import HomeFeedClient from './HomeFeedClient';

interface HomeFeedProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomeFeedServer({ searchParams }: HomeFeedProps) {
  // 1. Await the promise
  const params = await searchParams;

  // 2. Access as plain object properties (NO .get() calls)
  const medium = (params.medium as string) || 'all';
  const year = (params.year as string) || 'all';
  const evaluation = (params.evaluation as string) || 'all';
  const rating = (params.rating as string) || 'all';
  const q = (params.q as string) || '';

  // Fetch all artworks (no server-side filtering; client handles it)
  const allArtworks = await fetchArtworks();

  return (
    <Suspense fallback={<div>Loading feed...</div>}>
      <HomeFeedClient
        allArtworks={allArtworks}
        initialFilters={{ medium, year, evaluation, rating, q }}
      />
    </Suspense>
  );
}
