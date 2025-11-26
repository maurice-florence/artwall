// src/utils/blurhash.ts
// Utility to decode BlurHash to a data URL for use as a blurDataURL in <Image />
import { decode } from 'blurhash';

export function blurHashToDataURL(blurHash: string, width = 32, height = 32): string {
  if (!blurHash) return '';
  const pixels = decode(blurHash, width, height);
  // Create a canvas to draw the pixels
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
