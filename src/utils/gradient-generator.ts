import type { DefaultTheme } from 'styled-components';
import type { Theme } from '@/styled';

// Simple in-memory cache to avoid recalculating gradients for the same
// input + theme pair during a render cycle. Keyed by a fingerprint of
// relevant theme fields (primary/complementary/body) to ensure cache
// invalidation when theme changes.
const gradientCache: Map<string, Map<string, string>> = new Map();
let gradientGenCount = 0;
let gradientGenTime = 0;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Safely convert a number to a color hue (0-360)
function numberToHue(num: number): number {
  return num % 360;
}

// Get a color variation that's guaranteed to be within the theme's palette
function getThemeCompatibleColor(
  baseHue: number, 
  theme: DefaultTheme, 
  variant: 'start' | 'middle' | 'end' = 'start',
  medium: string = 'other'
): string {
  // Extract the theme's colors
  const primaryColor = theme.primary || '#0b8783'; // Use default if not set
  const complementaryColor = theme.complementary || '#f4787c'; // Use default if not set
  const categoryColor = theme.categories[medium as keyof typeof theme.categories];

  const primaryHsl = rgbToHsl(hexToRgb(primaryColor));
  const complementaryHsl = rgbToHsl(hexToRgb(complementaryColor));
  const categoryHsl = categoryColor ? rgbToHsl(hexToRgb(categoryColor)) : primaryHsl;

  // Select base color based on medium
  let baseColorHsl;
  switch (medium) {
    case 'poetry':
    case 'writing':
      // Use primary color with enhanced saturation for poetry/writing
      baseColorHsl = {
        h: primaryHsl.h,
        s: Math.min(100, primaryHsl.s * 1.1), // 10% more saturated
        l: Math.min(65, primaryHsl.l * 1.1) // Slightly lighter
      };
      break;
    case 'audio':
    case 'music':
      // Use complementary color with enhanced saturation for audio/music
      baseColorHsl = {
        h: complementaryHsl.h,
        s: Math.min(100, complementaryHsl.s * 1.4), // 40% more saturated
        l: Math.max(45, complementaryHsl.l * 0.9) // Slightly darker
      };
      break;
    default:
      // For other mediums, blend with the category color
      baseColorHsl = {
        h: categoryHsl.h,
        s: Math.min(90, (categoryHsl.s + primaryHsl.s) / 2 * 1.2), // Blend saturation
        l: categoryHsl.l
      };
  }

  // Calculate final hue based on medium type
  let hue;
  if (medium === 'audio' || medium === 'music') {
    // For audio/music cards, use complementary color's hue with moderate variation
    hue = (baseColorHsl.h + (baseHue % 25)) % 360;
  } else if (medium === 'poetry' || medium === 'writing') {
    // For poetry/writing cards, stay very close to primary color
    hue = (baseColorHsl.h + (baseHue % 20)) % 360;
  } else {
    // For other cards, allow more variation while staying within a category-appropriate range
    const variationRange = baseHue % 30; // Reduced from 45 for more consistency
    hue = (baseColorHsl.h + variationRange) % 360;
  }

  // Adjust base color characteristics based on medium
  let adjustedBaseColor = { ...baseColorHsl };
  if (medium === 'audio' || medium === 'music') {
    adjustedBaseColor = {
      h: hue,
      s: Math.min(100, baseColorHsl.s * 1.3), // More saturated for audio
      l: Math.max(40, baseColorHsl.l * 0.9) // Slightly darker for audio
    };
  } else if (medium === 'poetry' || medium === 'writing') {
    adjustedBaseColor = {
      h: hue,
      s: Math.min(100, baseColorHsl.s * 1.4), // Most saturated for poetry
      l: baseColorHsl.l // Keep original lightness for poetry
    };
  } else {
    adjustedBaseColor = {
      h: hue,
      s: Math.min(100, baseColorHsl.s * 0.2), // Standard saturation increase
      l: Math.min(95, baseColorHsl.l + 10) // Lighter for other types
    };
  }
  baseColorHsl = adjustedBaseColor;

  // Set saturation and lightness based on the variant
  let saturation: number;
  let lightness: number;

  switch (variant) {
    case 'start':
      saturation = Math.min(85, baseColorHsl.s + 15); // More saturated start
      lightness = Math.max(75, baseColorHsl.l + 5); // Lighter
      break;
    case 'middle':
      saturation = Math.min(70, baseColorHsl.s + 10); // More colorful middle
      lightness = Math.max(80, baseColorHsl.l + 10); // Even lighter middle
      break;
    case 'end':
      saturation = Math.min(55, baseColorHsl.s + 5); // Maintain some color at the end
      lightness = Math.max(85, baseColorHsl.l + 15); // Lightest end
      break;
  }
  // Darken writing medium gradients a bit to give more readable contrast
  if (medium === 'writing' || medium === 'poetry') {
    // reduce lightness across variants, clamp reasonably
    lightness = Math.max(30, Math.min(85, lightness - 12));
    // keep saturation a bit higher for color richness
    saturation = Math.min(100, saturation + 6);
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Helper function to convert RGB to HSL
function rgbToHsl(rgb: { r: number, g: number, b: number }): { h: number, s: number, l: number } {
  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Generate a unique gradient based on the input string and current theme
 */
export function generateUniqueGradient(inputString: string, theme: DefaultTheme, medium: string = 'other'): string {
  // Build a small theme fingerprint to key cache entries. We only include
  // fields that affect gradient output (primary, complementary, body).
  const themeKey = `${(theme as any).primary || ''}|${(theme as any).complementary || ''}|${(theme as any).body || ''}`;
  const cacheKey = `${inputString}::${medium}`;

  let inner = gradientCache.get(themeKey);
  if (inner) {
    const cached = inner.get(cacheKey);
    if (cached) return cached;
  } else {
    inner = new Map();
    gradientCache.set(themeKey, inner);
  }

  const start = performance && typeof performance.now === 'function' ? performance.now() : Date.now();
  const hash = hashString(inputString);
  const baseHue = numberToHue(hash);
  
  // Generate theme-compatible colors with softer variations
  const color1 = getThemeCompatibleColor(baseHue, theme, 'start', medium);
  const color2 = getThemeCompatibleColor(baseHue + 25, theme, 'middle', medium);
  const color3 = getThemeCompatibleColor(baseHue + 50, theme, 'end', medium);
  
  // Create a dynamic gradient pattern with softer angles for smoother transitions
  const angle = ((hash % 90) + 135); // Center around diagonal for smooth transitions
  const result = `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;

  // store and record profiling info
  inner.set(cacheKey, result);
  const end = performance && typeof performance.now === 'function' ? performance.now() : Date.now();
  gradientGenCount++;
  gradientGenTime += (end - start);
  // Occasionally log profiling info in development (not more than every 500 calls)
  if (gradientGenCount % 500 === 0 && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug(`gradient-generator: ${gradientGenCount} calls, avg ${(gradientGenTime/gradientGenCount).toFixed(2)} ms/call`);
  }

  return result;
}

// For text overlays on the gradient, determine if we need light or dark text
export function shouldUseDarkText(gradient: string): boolean {
  // With our new lighter gradients, we'll always use dark text
  return true;
}