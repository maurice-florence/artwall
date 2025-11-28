
import { describe, it, expect } from 'vitest';

function getResizedImageUrl(originalUrl, size = 'original') {
  if (!originalUrl || size === 'original') return originalUrl;
  if (!originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }
  const pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
  if (!pathMatch) return originalUrl;
  const path = decodeURIComponent(pathMatch[1]);
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const resizedPath = `${basePath}__${size}.${extension}`;
  return originalUrl.replace(
    encodeURIComponent(path),
    encodeURIComponent(resizedPath)
  );
}

function getSizeSpec(size) {
  switch (size) {
    case 'thumbnail': return '200x200';
    case 'card': return '400x400';
    case 'full': return '1200x1200';
    default: return 'original';
  }
}

describe('getResizedImageUrl', () => {
  const sampleUrls = [
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20200326_drawing_marker_disgust_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/sculpture%2F20230812_sculpture_clay_sebastian_01.jpg?alt=media'
  ];
  const sizes = ['thumbnail', 'card', 'full'];
  for (const originalUrl of sampleUrls) {
    for (const size of sizes) {
      it(`should generate correct resized URL for ${originalUrl.split('/').pop()?.split('?')[0]} and size ${size}`, () => {
        const resizedUrl = getResizedImageUrl(originalUrl, size);
        expect(resizedUrl).toContain(`__${size}.`);
      });
    }
  }
  it('should return original URL for size "original"', () => {
    expect(getResizedImageUrl(sampleUrls[0], 'original')).toBe(sampleUrls[0]);
  });
  it('should return original URL if not firebasestorage', () => {
    expect(getResizedImageUrl('https://example.com/image.jpg', 'card')).toBe('https://example.com/image.jpg');
  });
});