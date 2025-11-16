// src/components/__tests__/MobileNav.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@/__tests__/test-utils';
import MobileNav from '@/components/MobileNav';
import { Artwork } from '@/types';

const baseArtwork = (over: Partial<Artwork>): Artwork => ({
  id: 'x',
  title: 'Untitled',
  year: 2024,
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

const sampleArtworks: Artwork[] = [
  baseArtwork({ id: '1', title: 'A', medium: 'drawing' as any }),
  baseArtwork({ id: '2', title: 'B', medium: 'writing' as any }),
];

describe('MobileNav', () => {
  beforeEach(() => {
    // Force mobile viewport
    (window as any).innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
  });

  it('renders hamburger and opens sidebar overlay on click', () => {
    render(<MobileNav artworks={sampleArtworks} />);

    const btn = screen.getByTestId('mobile-nav-button');
    fireEvent.click(btn);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });

  it('closes when clicking overlay', () => {
    render(<MobileNav artworks={sampleArtworks} />);
    fireEvent.click(screen.getByTestId('mobile-nav-button'));

    const overlay = screen.getByTestId('sidebar-overlay');
    fireEvent.click(overlay);

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });
});
