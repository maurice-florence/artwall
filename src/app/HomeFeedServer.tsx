

import { fetchArtworks } from '@/lib/server/firebaseAdmin';
import MasonryGrid from '@/components/ui/MasonryGrid';

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

  console.log('Fetching artworks with:', { medium, year, evaluation, rating });

  // You may need to map/filter params for your fetchArtworks implementation
  const artworks = await fetchArtworks({
    medium: medium === 'all' ? undefined : medium,
    year: year === 'all' ? undefined : year,
    evaluation: evaluation === 'all' ? undefined : evaluation,
    rating: rating === 'all' ? undefined : rating,
    // ...add other params as needed
  });

  return <MasonryGrid artworks={artworks} />;
}
