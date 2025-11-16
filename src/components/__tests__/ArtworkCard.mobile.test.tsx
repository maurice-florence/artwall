// src/components/__tests__/ArtworkCard.mobile.test.tsx
import React from 'react';
import { render, screen } from '@/__tests__/test-utils';
import ArtworkCard from '@/components/ArtworkCard';
import { Artwork } from '@/types';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

const baseArtwork = (over: Partial<Artwork>): Artwork => ({
  id: 'x',
  title: 'Card',
  year: 2025,
  month: 1,
  day: 1,
  description: '',
  medium: 'drawing' as any,
  subtype: 'other' as any,
  isHidden: false,
  language1: 'en',
  translations: {},
  recordCreationDate: Date.now(),
  ...over,
});

describe('ArtworkCard mobile behavior', () => {
  it('marks flipping disabled on coarse pointer (mobile)', () => {
    mockMatchMedia(false); // not hover+fine
    const artwork = baseArtwork({ coverImageUrl: 'https://firebasestorage.googleapis.com/v0/b/x/o/img.jpg?alt=media' });
    render(<ArtworkCard artwork={artwork} onSelect={() => {}} />);
    const cardInner = screen.getByTestId(`artwork-card-${artwork.id}`).querySelector('[data-flip]');
    expect(cardInner).toHaveAttribute('data-flip', 'disabled');
  });
});
