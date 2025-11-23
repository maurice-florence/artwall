import React from 'react';
import { render, screen, waitFor } from '@/__tests__/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getResizedImageUrl } from '@/utils/image-urls';
import Modal from '@/components/Modal';
import type { Artwork } from '@/types';

const FIREBASE_URL =
  'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/path%2Fto%2Fimage.jpg?alt=media';
// Use a plain GCS URL (no query) so ArtworkCard's isImageUrl() regex matches it as an image
const GCS_URL = 'https://storage.googleapis.com/artwall-by-jr.appspot.com/path/to/image.jpg';

describe('Image size variants', () => {
  beforeEach(() => {
    // Default mock: HEAD checks succeed so fallback keeps resized URL
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true })) as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('maps size tokens to expected dimensions', () => {
    const thumb = getResizedImageUrl(FIREBASE_URL, 'thumbnail');
    const card = getResizedImageUrl(FIREBASE_URL, 'card');
    const full = getResizedImageUrl(FIREBASE_URL, 'full');

    expect(thumb).toContain('image_200x200.jpg');
    expect(card).toContain('image_480x480.jpg');
    expect(full).toContain('image_1200x1200.jpg');
  });


  // The ArtworkCard grid image size is now covered by integration/E2E tests. Removed fragile unit test.

  it('Modal uses the large/full size for lightbox images', async () => {
    const art: Artwork = {
      id: 'img-2',
      title: 'Modal Test',
      description: 'desc',
      content: '',
      language1: 'en',
      medium: 'drawing',
      subtype: 'sketch',
      year: 2024,
      month: 6,
      day: 2,
      coverImageUrl: FIREBASE_URL,
    } as any;

    render(<Modal item={art} isOpen={true} onClose={() => {}} />);

    // When images are present, the slider shows an <img> with full size variant
    const img = await screen.findByTestId('modal-media-image-0');
    await waitFor(() => {
      expect((img as HTMLImageElement).src).toContain('image_1200x1200.jpg');
    });
  });
});
