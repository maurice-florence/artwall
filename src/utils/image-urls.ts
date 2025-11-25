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
  // Firebase extension format: {filename}_{dimensions}.{ext}
  const extension = path.split('.').pop();
  const basePath = path.slice(0, -(extension?.length || 0) - 1);
  // Map legacy size tokens to actual dimensions
  const sizeMap: Record<Exclude<ImageSize, 'original'>, string> = {
    thumbnail: '200x200',
    card: '400x400',      // Reduced from 480x480 for faster loading
    full: '800x800',      // Reduced from 1200x1200 for better performance
  };
  const dims = sizeMap[size as Exclude<ImageSize, 'original'>] || '1200x1200';
  const resizedPath = `${basePath}_${dims}.${extension}`;

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

/**
 * Derives the original image URL from a possibly resized Firebase URL.
 * It removes the _{width}x{height} suffix before the file extension when present.
 * If the URL doesn't match known Firebase formats or has no resize suffix, returns the input unchanged.
 */
export function getOriginalImageUrl(possiblyResizedUrl: string): string {
  if (!possiblyResizedUrl) return possiblyResizedUrl;

  // Only operate on Firebase Storage URLs we know how to transform
  const isFirebase = possiblyResizedUrl.includes('firebasestorage.googleapis.com') || possiblyResizedUrl.includes('storage.googleapis.com');
  if (!isFirebase) return possiblyResizedUrl;

  try {
    // Extract the path portion, operate on filename, then reconstruct
    let pathMatch: RegExpMatchArray | null = null;
    let bucket: string | undefined;

    if (possiblyResizedUrl.includes('firebasestorage.googleapis.com')) {
      pathMatch = possiblyResizedUrl.match(/\/o\/(.*?)\?/);
      const bucketMatch = possiblyResizedUrl.match(/\/b\/([^\/]+)\//);
      bucket = bucketMatch ? bucketMatch[1] : undefined;
    } else {
      pathMatch = possiblyResizedUrl.match(/storage\.googleapis\.com\/[^\/]+\/(.*?)(?:\?|$)/);
      const bucketMatch = possiblyResizedUrl.match(/storage\.googleapis\.com\/([^\/]+)\//);
      bucket = bucketMatch ? bucketMatch[1] : undefined;
    }

    if (!pathMatch) return possiblyResizedUrl;

    const encodedPath = pathMatch[1];
    const decodedPath = decodeURIComponent(encodedPath);

    // Remove _{width}x{height} just before the file extension
    const originalPath = decodedPath.replace(/_(\d+)x(\d+)(?=\.[^.]+$)/, '');

    // Rebuild the URL in the same host style
    if (possiblyResizedUrl.includes('firebasestorage.googleapis.com')) {
      const params = possiblyResizedUrl.includes('?') ? possiblyResizedUrl.split('?')[1] : 'alt=media';
      const finalBucket = bucket || 'artwall-by-jr.appspot.com';
      return `https://firebasestorage.googleapis.com/v0/b/${finalBucket}/o/${encodeURIComponent(originalPath)}?${params}`;
    } else {
      const finalBucket = bucket || 'artwall-by-jr.firebasestorage.app';
      return `https://storage.googleapis.com/${finalBucket}/${originalPath}`;
    }
  } catch {
    return possiblyResizedUrl;
  }
}