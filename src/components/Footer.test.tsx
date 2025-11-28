// Mock firebase/app to provide getApps and initializeApp for singleton guard
vi.mock('firebase/app', () => ({
  getApps: () => [],
  initializeApp: vi.fn(() => ({})),
}));

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import Footer from '@/components/Footer';
import { vi } from 'vitest';

// Mock Firebase services
vi.mock('@/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(),
  onValue: vi.fn((_ref, callback) => {
    // Simulate a Firebase snapshot with some data
    const mockSnapshot = {
      val: () => ({
        artwork1: { medium: 'writing', subtype: 'poem', year: 2023 },
        artwork2: { medium: 'audio', subtype: 'song', year: 2022 },
      }),
    };
    callback(mockSnapshot);
    return vi.fn(); // Return a mock unsubscribe function
  }),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null); // Simulate no user logged in
    return vi.fn(); // Return a mock unsubscribe function
  }),
}));

// Mock useArtworks hook
vi.mock('@/context/ArtworksContext', () => ({
  useArtworks: () => ({
    artworks: [
      { id: '1', medium: 'writing', subtype: 'poem', year: 2023, title: 'Test Poem' },
      { id: '2', medium: 'audio', subtype: 'song', year: 2022, title: 'Test Song' },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('Footer', () => {
  it('renders the footer with last updated text', async () => {
    await act(async () => {
      render(
        <ThemeProvider theme={atelierTheme}>
          <Footer />
        </ThemeProvider>
      );
    });

    // Check if the "Laatst bijgewerkt" text is present
    expect(screen.getByText(/Laatst bijgewerkt/i)).toBeInTheDocument();
  });
});
