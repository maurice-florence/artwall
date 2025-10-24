// src/utils/image-urls.ts

type ImageSize = 'thumbnail' | 'card' | 'full' | 'original';

/**
 * Gets the URL for a resized image variant.
 * @param originalUrl The original Firebase Storage URL
 * @param size The desired size variant ('thumbnail', 'card', 'full', or 'original')
 * @returns The URL for the resized image
 */
export function getResizedImageUrl(originalUrl: string, size: ImageSize = 'original'): string {
  if (!originalUrl || size === 'original') return originalUrl;

  // Only process URLs from Firebase Storage
  if (!originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }

  // Extract the path part from the URL (everything after /o/)
  const pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
  if (!pathMatch) return originalUrl;

  const path = decodeURIComponent(pathMatch[1]);
  
  // Construct the resized image URL
  // The extension creates files in the format: {path}__{size}.{ext}
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const resizedPath = `${basePath}__${size}.${extension}`;
  
  // Replace the path in the original URL
  return originalUrl.replace(
    encodeURIComponent(path),
    encodeURIComponent(resizedPath)
  );
}