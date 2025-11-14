// src/utils/image-urls.ts

type ImageSize = 'thumbnail' | 'card' | 'full' | 'original';

/**
 * Gets the URL for a resized image variant.
 * Firebase Storage Resize Images extension creates files in format: {path}_{width}x{height}.{ext}
 * Falls back to original image if resized version is not available.
 * @param originalUrl The original Firebase Storage URL
 * @param size The desired size variant ('thumbnail', 'card', 'full', or 'original')
 * @returns The URL for the resized image, or original if not available
 */
export function getResizedImageUrl(originalUrl: string, size: ImageSize = 'original'): string {
  if (!originalUrl || size === 'original') return originalUrl;

  // Handle both storage.googleapis.com and firebasestorage.googleapis.com URLs
  if (!originalUrl.includes('storage.googleapis.com') && !originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }

  // Map size to actual dimensions created by Firebase Storage Resize Images extension
  // These are the actual dimensions observed in the storage bucket (maintaining aspect ratio)
  const sizeMap: Record<Exclude<ImageSize, 'original'>, string> = {
    thumbnail: '200x200',  // Small thumbnails
    card: '480x480',       // Card display size (actual observed size)
    full: '1200x1200'      // Full resolution
  };

  const dimensions = sizeMap[size as Exclude<ImageSize, 'original'>];
  if (!dimensions) return originalUrl;

  // Extract the path part from the URL
  let pathMatch: RegExpMatchArray | null = null;

  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path?params
    pathMatch = originalUrl.match(/\/o\/(.*?)\?/);
  } else if (originalUrl.includes('storage.googleapis.com')) {
    // Format: https://storage.googleapis.com/bucket/path
    pathMatch = originalUrl.match(/storage\.googleapis\.com\/[^\/]+\/(.*?)(?:\?|$)/);
  }

  if (!pathMatch) return originalUrl;

  const path = decodeURIComponent(pathMatch[1]);
  
  // Create the resized image path
  // Firebase extension format: {filename}_{dimensions}.{ext}
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  const resizedPath = `${basePath}_${dimensions}.${extension}`;
  
  // Reconstruct URL based on original format
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

/**
 * Gets a resized image URL with fallback handling.
 * If the resized image is not accessible, returns the original image URL.
 * @param originalUrl The original Firebase Storage URL
 * @param size The desired size variant
 * @returns Promise that resolves to the best available image URL
 */
export async function getResizedImageUrlWithFallback(originalUrl: string, size: ImageSize = 'original'): Promise<string> {
  if (size === 'original') return originalUrl;
  
  const resizedUrl = getResizedImageUrl(originalUrl, size);
  
  try {
    const response = await fetch(resizedUrl, { method: 'HEAD' });
    if (response.ok) {
      return resizedUrl;
    }
  } catch (error) {
    console.warn(`Resized image not accessible, falling back to original: ${resizedUrl}`);
  }
  
  return originalUrl;
}