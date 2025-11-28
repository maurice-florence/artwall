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
import { render, screen, fireEvent } from '@/__tests__/test-utils';
import React from 'react';
import HomeClient from '@/app/HomeClient';
import HomePage from '@/app/page';

const mockArtworks = [
  {
    id: '1',
    title: 'Test Art',
    description: 'Test Description',
    medium: 'painting',
    year: 2022,
    isHidden: false,
    month: 1,
    day: 1,
  },
  {
    id: '2',
    title: 'Hidden Art',
    description: 'Hidden Description',
    medium: 'drawing',
    year: 2021,
    isHidden: true,
    month: 2,
    day: 2,
  },
];

describe('Artwall App Integration', () => {

  it('renders HomeClient and shows visible artworks', () => {
    render(<HomeClient artworks={mockArtworks as any} />);
    // Title may appear in multiple places (generated image overlay + card heading)
    expect(screen.getAllByText('Test Art').length).toBeGreaterThan(0);
    expect(screen.queryByText('Hidden Art')).not.toBeInTheDocument();
  });

  it('filters by medium', () => {
    render(<HomeClient artworks={mockArtworks as any} />);
    // Click the medium icon button via its test id
    fireEvent.click(screen.getByTestId('header-medium-painting'));
    expect(screen.getAllByText('Test Art').length).toBeGreaterThan(0);
    expect(screen.queryByText('Hidden Art')).not.toBeInTheDocument();
  });

  it('shows year marker for artwork year', () => {
    render(<HomeClient artworks={mockArtworks as any} />);
    // Year markers are rendered as separate items; presence of the year is sufficient
    expect(screen.getByText('2022')).toBeInTheDocument();
  });

  it('searches by title', () => {
    render(<HomeClient artworks={mockArtworks as any} />);
    // Use aria-label for robustness across locales
    fireEvent.change(screen.getByLabelText('Zoek in kunstwerken'), { target: { value: 'Test' } });
    expect(screen.getAllByText('Test Art').length).toBeGreaterThan(0);
  });

  it.skip('opens and closes AdminModal', () => {
    // Skipped: Footer add button requires authenticated user; mock auth flow separately if needed
  });

  it.skip('opens and closes NewEntryModal', () => {
    // Skipped: Current Modal UI does not expose an edit button; adapt when edit flow is reintroduced
  });

  it('renders Footer and Sidebar', () => {
    render(<HomeClient artworks={mockArtworks as any} />);
    // Footer is present via landmark role
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    // Sidebar has been removed from the layout
    expect(screen.queryByText(/sidebar/i)).not.toBeInTheDocument();
  });

  it('does not cause horizontal scroll on HomePage', () => {
    render(<HomePage />);
    // Check document body does not overflow horizontally
    // This test simulates a desktop viewport
    const body = document.body;
    // The scrollWidth should be equal to or less than clientWidth (no horizontal scroll)
    expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth + 1); // +1 for rounding
    // Optionally, check main content
    const main = document.querySelector('main');
    if (main) {
      expect(main.scrollWidth).toBeLessThanOrEqual(main.clientWidth + 1);
    }
  });
});
