import { render, screen, fireEvent, act, waitFor } from '@/__tests__/test-utils';
import React from 'react';
import HomeClient from '@/app/HomeClient';
import { vi } from 'vitest';
import { DEFAULT_MIN_SPINNER_MS, DEFAULT_IMAGE_THRESHOLD } from '@/config/spinner';

// Provide multiple artworks each with an image to trigger threshold logic
const makeImageArtwork = (id: string) => ({
  id,
  title: `Artwork ${id}`,
  description: 'desc',
  medium: 'painting',
  year: 2024,
  isHidden: false,
  month: 6,
  day: 1,
  coverImageUrl: `/test-image-${id}.jpg`
});

const mockArtworks = [makeImageArtwork('1'), makeImageArtwork('2'), makeImageArtwork('3'), makeImageArtwork('4')];

describe('HomeClient page spinner disappearance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('initiates fade-out after max timeout (override config)', () => {
    // Use normal fade (no testInstantFade) so spinner still present when fading begins
    render(<HomeClient artworks={mockArtworks as any} spinnerConfig={{ minMs: 10, maxMs: 50, imageThreshold: 5 }} />);
    const spinner = screen.getByTestId('page-spinner');
    expect(spinner).toHaveAttribute('data-fading', 'false');
    act(() => { vi.advanceTimersByTime(60); });
    vi.runOnlyPendingTimers();
    expect(screen.getByTestId('page-spinner')).toHaveAttribute('data-fading', 'true');
  });
});
