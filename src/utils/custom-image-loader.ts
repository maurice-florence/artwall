// src/utils/custom-image-loader.ts
// Custom loader for Next.js <Image /> to serve pre-resized Firebase Storage thumbnails

export function customImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // Assumes your Firebase Storage URLs follow a pattern for resized images, e.g. /thumbs/{width}/{filename}
  // You may need to adjust this logic to match your actual storage structure
  const url = new URL(src);
  // Example: replace /images/ with /thumbs/{width}/
  url.pathname = url.pathname.replace(/\/images\//, `/thumbs/${width}/`);
  if (quality) url.searchParams.set('q', String(quality));
  return url.toString();
}

// Usage in <Image />:
// <Image loader={customImageLoader} src={...} width={...} height={...} ... />
