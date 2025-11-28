// Mock firebase/database to avoid getProvider errors in test environment
const FAKE_ARTWORK_ID = '20030419_audio_electronic_slordige-symfonie';
const FAKE_MEDIUM = 'audio_electronic';
const FAKE_ARTWORK = {
  [FAKE_ARTWORK_ID]: {
    title: 'Slordige Symfonie',
    medium: FAKE_MEDIUM,
    id: FAKE_ARTWORK_ID,
  }
};
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  get: vi.fn(async () => ({
    forEach: (cb: any) => {
      // Simulate one medium node containing the artwork
      cb({
        key: FAKE_MEDIUM,
        val: () => FAKE_ARTWORK,
      });
    },
  })),
  onValue: vi.fn(() => () => {}), // Return a no-op unsubscribe function
}));
// Mock firebase/app to provide a consistent singleton app for getApps
vi.mock('firebase/app', () => {
  const mockApp = {};
  return {
    getApps: () => [mockApp],
    initializeApp: vi.fn(() => mockApp),
  };
});
import { render, screen, waitFor } from '@testing-library/react';
import Footer from '../Footer';
import { ref, get } from 'firebase/database';
import { realtimeDb } from '@/firebase/client';
import { act } from 'react-dom/test-utils';


// Use the singleton instance from src/firebase/client.ts
const db = realtimeDb;

import type { Artwork } from '../../types';
const getArtworkFromDb = async (artworkId: string): Promise<Artwork | null> => {
  const snapshot = await get(ref(db, `artwall`));
  let found: Artwork | null = null;
  snapshot.forEach((mediumSnap) => {
    const medium = mediumSnap.key;
    const artworks = mediumSnap.val();
    if (artworks && artworks[artworkId]) {
      found = { ...artworks[artworkId], medium, id: artworkId } as Artwork;
    }
  });
  return found;
};

describe('Artwork metadata consistency', () => {
  it('shows debug info with correct medium count in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const artworkId = '20030419_audio_electronic_slordige-symfonie';
    const dbArtwork = await getArtworkFromDb(artworkId);
    expect(dbArtwork).toBeTruthy();
    if (!dbArtwork) throw new Error('Artwork not found in DB');

    await act(async () => {
      render(<Footer artworks={[dbArtwork]} />);
    });

    // Check that the debug info contains the correct medium and count
    expect(screen.getByText(/audio_electronic:/)).toBeInTheDocument();
    expect(screen.getByText(/App: 1/)).toBeInTheDocument();
  });
});
