// lib/firebase-loader.ts
'use client';

/**
 * Custom loader for Next.js <Image /> to use pre-resized Firebase images.
 * Assumes Firebase Resize Images extension is used and images are public.
 * Maps requested width to nearest available size (200, 640, 1280).
 */
export default function firebaseLoader({ src, width }: { src: string, width: number }) {
  if (!src.includes('firebasestorage.googleapis.com')) return src;

  // Supported sizes (must match Firebase extension config)
  const supported = [200, 480, 1200];
  const size = supported.find(s => s >= width) || supported[supported.length - 1];

  // Insert _{size}x{size} before file extension
  const [base, query = ''] = src.split('?');
  const lastDot = base.lastIndexOf('.');
  if (lastDot === -1) return src;
  const name = base.substring(0, lastDot);
  const ext = base.substring(lastDot);
  const resized = `${name}_${size}x${size}${ext}`;
  return `${resized}${query ? '?' + query : ''}`;
}
