// src/app/page.server.tsx
// Server component for Partial Prerendering (PPR) and Suspense
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import MasonryWrapper from '@/components/ui/MasonryWrapper';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import YearMarkerCard from '@/components/YearMarker';
import ArtworkCard from '@/components/ArtworkCard';
import { fetchArtworks } from '@/lib/server/firebaseAdmin';

export const experimental_ppr = true;

export default async function Page() {
  const artworks = await fetchArtworks();
  // TODO: Add timelineItems logic if needed (group by year, etc.)
  return (
    <main>
      <h1>Artwall Gallery</h1>
      <Suspense fallback={<div>Loading grid...</div>}>
        <MasonryWrapper>
          {artworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} onSelect={() => {}} />
          ))}
        </MasonryWrapper>
      </Suspense>
      <Footer artworks={artworks} />
    </main>
  );
}
