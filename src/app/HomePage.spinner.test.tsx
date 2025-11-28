// Mock firebase/app to provide a consistent singleton app for getApps
vi.mock('firebase/app', () => {
  const mockApp = {};
  return {
    getApps: () => [mockApp],
    initializeApp: vi.fn(() => mockApp),
  };
});
// Mock firebase/database to avoid getProvider errors in test environment
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: vi.fn(() => () => {}), // Return a no-op unsubscribe function
}));
import { render, screen } from '@/__tests__/test-utils';
import React from 'react';
import HomeClient from '@/app/HomeClient';

// Provide a minimal artwork set including one with an image so the spinner waits for threshold logic
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

describe('HomeClient page spinner', () => {
  it('renders initial page spinner before images threshold met', () => {
    render(<HomeClient artworks={mockArtworks as any} />);
    expect(screen.getByTestId('page-spinner')).toBeInTheDocument();
  });
});
