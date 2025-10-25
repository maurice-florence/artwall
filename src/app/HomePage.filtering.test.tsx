import React from 'react';
import { render, screen, fireEvent } from '../__tests__/test-utils';
import { vi } from 'vitest';
import { Artwork } from '@/types';

const sampleArtworks: Artwork[] = [
  { id: 'a1', title: 'One', year: 2020, month:1, day:1, description: 'first', medium: 'drawing' as any, subtype: 'default' as any, language1: 'nl', translations: {}, recordCreationDate: Date.now(), evaluation: '5', evaluationNum: 5, rating: '4', ratingNum: 4 },
  { id: 'a2', title: 'Two', year: 2021, month:1, day:1, description: 'second', medium: 'writing' as any, subtype: 'default' as any, language1: 'nl', translations: {}, recordCreationDate: Date.now(), evaluation: '3', evaluationNum: 3, rating: '', ratingNum: null },
  { id: 'a3', title: 'Three', year: 2022, month:1, day:1, description: 'third', medium: 'audio' as any, subtype: 'default' as any, language1: 'nl', translations: {}, recordCreationDate: Date.now(), evaluation: 2 as any, evaluationNum: 2, rating: '5', ratingNum: 5 },
];

// Mock useArtworks before importing HomePage so module-level imports use mocked data
vi.mock('@/context/ArtworksContext', () => ({
  useArtworks: () => ({ artworks: sampleArtworks, isLoading: false, error: null, refetch: () => {} })
}));

import HomePage from './page';

describe('HomePage filtering integration', () => {
  it('filters artworks by evaluation threshold', async () => {
  render(<HomePage />);
    // open header evaluation dropdown and select 4
    const evalBtn = await screen.findByTestId('header-filter-evaluation');
    fireEvent.click(evalBtn);
    const four = await screen.findByTitle('4 seals of meer');
    fireEvent.click(four);
    // Now only artwork a1 (evaluation 5) should be visible in collage
    // give some time for re-render
    const a1 = await screen.findByTestId('artwork-card-a1');
    expect(a1).toBeInTheDocument();
    expect(screen.queryByTestId('artwork-card-a2')).toBeNull();
    expect(screen.queryByTestId('artwork-card-a3')).toBeNull();
  });

  it('filters artworks by rating threshold', async () => {
  render(<HomePage />);
    const ratingBtn = await screen.findByTestId('header-filter-rating');
    fireEvent.click(ratingBtn);
    const four = await screen.findByTitle('4 sterren of meer');
    fireEvent.click(four);
    // Now artworks with rating >=4 are a1 (4) and a3 (5)
    expect(await screen.findByTestId('artwork-card-a1')).toBeInTheDocument();
    expect(await screen.findByTestId('artwork-card-a3')).toBeInTheDocument();
    expect(screen.queryByTestId('artwork-card-a2')).toBeNull();
  });
});
