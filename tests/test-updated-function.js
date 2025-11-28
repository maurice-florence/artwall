
import { describe, it, expect } from 'vitest';

function getResizedImageUrl(originalUrl, size = 'original') {
  if (!originalUrl || size === 'original') return originalUrl;
  if (!originalUrl.includes('storage.googleapis.com') && !originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }
  const sizeMap = {
    thumbnail: '200x200',
    card: '400x400',
    full: '1200x1200'
  };
  const dimensions = sizeMap[size];
  if (!dimensions) return originalUrl;
  let pathMatch = null;
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
  } else if (originalUrl.includes('storage.googleapis.com')) {
    pathMatch = originalUrl.match(/storage\.googleapis\.com\/[^\/]+\/(.*?)(?:\?|$)/);
  }
  if (!pathMatch) return originalUrl;
  const path = decodeURIComponent(pathMatch[1]);
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const resizedPath = `${basePath}_${dimensions}.${extension}`;
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    const bucketMatch = originalUrl.match(/\/b\/([^\/]+)\/o\//);
    const bucket = bucketMatch ? bucketMatch[1] : 'artwall-by-jr.appspot.com';
    const params = originalUrl.includes('?') ? originalUrl.split('?')[1] : 'alt=media';
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(resizedPath)}?${params}`;
  } else {
    const bucketMatch = originalUrl.match(/storage\.googleapis\.com\/([^\/]+)\//);
    const bucket = bucketMatch ? bucketMatch[1] : 'artwall-by-jr.firebasestorage.app';
    return `https://storage.googleapis.com/${bucket}/${resizedPath}`;
  }
}

describe('getResizedImageUrl (updated function)', () => {
  const testUrls = [
    'https://storage.googleapis.com/artwall-by-jr.firebasestorage.app/drawing/20050101_drawing_pencil_uit_01.jpg',
    'https://storage.googleapis.com/artwall-by-jr.firebasestorage.app/drawing/20080101_drawing_marker_bjork_01.jpg'
  ];
  it('should generate correct resized URLs for card, thumbnail, and full', () => {
    for (const url of testUrls) {
      expect(getResizedImageUrl(url, 'card')).toContain('_400x400.');
      expect(getResizedImageUrl(url, 'thumbnail')).toContain('_200x200.');
      expect(getResizedImageUrl(url, 'full')).toContain('_1200x1200.');
    }
  });
  it('should return original URL for size "original"', () => {
    expect(getResizedImageUrl(testUrls[0], 'original')).toBe(testUrls[0]);
  });
  it('should return original URL if not storage/firebasestorage', () => {
    expect(getResizedImageUrl('https://example.com/image.jpg', 'card')).toBe('https://example.com/image.jpg');
  });
});