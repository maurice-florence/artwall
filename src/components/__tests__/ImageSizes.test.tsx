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

  it('ArtworkCard uses the medium/card size for grid cards', async () => {
  const art: Artwork = {
      id: 'img-1',
      title: 'Card Test',
      description: 'desc',
      content: '',
      language1: 'en',
      medium: 'drawing',
      subtype: 'sketch',
      year: 2024,
      month: 5,
      day: 1,
  coverImageUrl: GCS_URL,
    } as any;

    // Mock the image resizing util so we can assert the requested size token
    vi.doMock('@/utils/image-urls', () => ({
      getResizedImageUrl: (url: string, size: string) => `${url}__${size}`,
    }));

    const { default: ArtworkCard } = await import('@/components/ArtworkCard');

    render(<ArtworkCard artwork={art} onSelect={() => {}} />);

    // Front face image uses resized card variant
    const img = screen.getByRole('img', { name: /card test|artwork/i });
  expect(img.getAttribute('src')).toMatch(/__card$/);
  });

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
