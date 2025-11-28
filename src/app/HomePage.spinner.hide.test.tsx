// Mock firebase/app to provide getApps and initializeApp for singleton guard
vi.mock('firebase/app', () => ({
  getApps: () => [],
  initializeApp: vi.fn(() => ({})),
}));
// Mock firebase/database to avoid getProvider errors in test environment
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: vi.fn(() => () => {}), // Return a no-op unsubscribe function
}));
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

  it('initiates fade-out after max timeout (instant fade, short timers)', () => {
    act(() => {
      render(<HomeClient artworks={mockArtworks as any} spinnerConfig={{ minMs: 1, maxMs: 2, imageThreshold: 1, fadeMs: 0 }} testInstantFade />);
    });
    // Spinner should be present immediately
    const spinner = screen.getByTestId('page-spinner');
    expect(spinner).toHaveAttribute('data-fading', 'false');
    act(() => { vi.advanceTimersByTime(3); });
    vi.runOnlyPendingTimers();
    // Spinner should be fading out instantly
    expect(screen.queryByTestId('page-spinner')).toBeNull();
  });
});
