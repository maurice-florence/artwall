import { render, screen, fireEvent, act, waitFor } from '@/__tests__/test-utils';
import React from 'react';
import HomeClient from '@/app/HomeClient';
import { vi } from 'vitest';

// Minimal artwork with image
const mockArtworks = [
  {
    id: 'img-1',
    title: 'Image Artwork',
    description: 'Has an image to trigger loading logic',
    medium: 'painting',
    year: 2024,
    isHidden: false,
    month: 3,
    day: 14,
    coverImageUrl: '/test-image.jpg'
  }
];

describe('HomeClient page spinner removal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('removes spinner after image load + min elapsed with instant fade', async () => {
    // Increase timeout for this async/timer-heavy test
  }, 10000);
    let img;
    act(() => {
      render(<HomeClient artworks={mockArtworks as any} spinnerConfig={{ minMs: 20, maxMs: 1000, imageThreshold: 1, fadeMs: 0 }} testInstantFade />);
    });
    expect(screen.getByTestId('page-spinner')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(25); });

    act(() => {
      img = screen.getByRole('img');
      fireEvent.load(img);
    });

    act(() => { vi.runOnlyPendingTimers(); });

    // Switch to real timers for waitFor
    vi.useRealTimers();
    await waitFor(() => {
      // Wait for spinner to start fading out
      expect(screen.getByTestId('page-spinner')).toHaveAttribute('data-fading', 'true');
    });
    // Switch back to fake timers and run pending timers to complete fade-out
    vi.useFakeTimers();
    act(() => { vi.runOnlyPendingTimers(); });
    // Wait for spinner to be removed from DOM
    await waitFor(() => {
      expect(screen.queryByTestId('page-spinner')).not.toBeInTheDocument();
    });
  });
});
