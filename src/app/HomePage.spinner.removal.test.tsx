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

// Mock next/image to call onLoad after a tick (works with fake timers)
vi.mock('next/image', () => {
  function MockNextImage(props: any) {
    React.useEffect(() => {
      if (props.onLoad) setTimeout(props.onLoad, 0);
    }, []);
    // Render a simple img for test
    return <img {...props} data-testid={props['data-testid'] || 'mock-image'} />;
  }
  return {
    __esModule: true,
    default: MockNextImage,
  };
});

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

    // Run all timers to process fade and removal
    await act(async () => { vi.runAllTimers(); });
    // Spinner should be removed from DOM
    expect(screen.queryByTestId('page-spinner')).not.toBeInTheDocument();
  }, 30000);
});
