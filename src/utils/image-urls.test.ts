import { describe, it, expect } from 'vitest';
import { getResizedImageUrl, getOriginalImageUrl } from './image-urls';

const base = 'https://firebasestorage.googleapis.com/v0/b/my-bucket/o/path%2Fimage.jpg?alt=media';

describe('image-urls utilities', () => {
  it('builds resized variants for Firebase URLs', () => {
    expect(getResizedImageUrl(base, 'thumbnail')).toMatch(/image_200x200\.jpg/);
    expect(getResizedImageUrl(base, 'card')).toMatch(/image_480x480\.jpg/);
    expect(getResizedImageUrl(base, 'full')).toMatch(/image_1200x1200\.jpg/);
  });

  it('returns original when not a Firebase URL', () => {
    const url = 'https://example.com/x.jpg';
    expect(getResizedImageUrl(url, 'card')).toBe(url);
  });

  it('derives original URL from resized variant', () => {
    const resized = 'https://firebasestorage.googleapis.com/v0/b/my-bucket/o/path%2Fimage_480x480.jpg?alt=media';
    expect(getOriginalImageUrl(resized)).toMatch(/image\.jpg/);
  });
});
