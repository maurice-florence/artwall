import type { DefaultTheme } from 'styled-components';
import type { Theme } from '@/styled';
import { 
  GRADIENT_SATURATION, 
  HUE_VARIATION, 
  BASE_SATURATION_MULTIPLIER,
  BASE_LIGHTNESS,
  GRADIENT_VARIANTS,
  WRITING_ADJUSTMENTS,
  GRADIENT_ANGLE,
  COLOR_STOP_HUE_SPACING
} from '@/config/gradient-settings';

// Simple in-memory cache to avoid recalculating gradients for the same
// input + theme pair during a render cycle. Keyed by a fingerprint of
// relevant theme fields (primary/complementary/body) to ensure cache
// invalidation when theme changes.
const gradientCache: Map<string, Map<string, string>> = new Map();
let gradientGenCount = 0;
let gradientGenTime = 0;

// Cache the saturation fingerprint to detect config changes in development
let lastSatFingerprint = '';

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
        s: Math.min(100, primaryHsl.s * BASE_SATURATION_MULTIPLIER.poetry),
        l: Math.min(BASE_LIGHTNESS.poetryMax, primaryHsl.l * BASE_LIGHTNESS.poetryMultiplier)
      };
      break;
    case 'audio':
    case 'music':
      // Use complementary color with enhanced saturation for audio/music
      baseColorHsl = {
        h: complementaryHsl.h,
        s: Math.min(100, complementaryHsl.s * BASE_SATURATION_MULTIPLIER.audio),
        l: Math.max(BASE_LIGHTNESS.audioMin, complementaryHsl.l * BASE_LIGHTNESS.audioMultiplier)
      };
      break;
    default:
      // For other mediums, blend with the category color
      baseColorHsl = {
        h: categoryHsl.h,
        s: Math.min(90, (categoryHsl.s + primaryHsl.s) / 2 * BASE_SATURATION_MULTIPLIER.other),
        l: categoryHsl.l
      };
  }

  // Calculate final hue based on medium type
  let hue;
  if (medium === 'audio' || medium === 'music') {
    // For audio/music cards, use complementary color's hue with moderate variation
    hue = (baseColorHsl.h + (baseHue % HUE_VARIATION.audio)) % 360;
  } else if (medium === 'poetry' || medium === 'writing') {
    // For poetry/writing cards, stay very close to primary color
    hue = (baseColorHsl.h + (baseHue % HUE_VARIATION.poetry)) % 360;
  } else {
    // For other cards, allow more variation while staying within a category-appropriate range
    const variationRange = baseHue % HUE_VARIATION.other;
    hue = (baseColorHsl.h + variationRange) % 360;
  }

  // Adjust base color characteristics based on medium
  let adjustedBaseColor = { ...baseColorHsl };
  
  // Use config file values for saturation
  const poetrySat = GRADIENT_SATURATION.poetry;
  const audioSat = GRADIENT_SATURATION.audio;
  const otherSat = GRADIENT_SATURATION.other;
  
  if (medium === 'audio' || medium === 'music') {
    adjustedBaseColor = {
      h: hue,
      s: Math.min(100, baseColorHsl.s + audioSat), // Add saturation value directly
      l: Math.max(40, baseColorHsl.l * 0.9) // Slightly darker for audio
    };
  } else if (medium === 'poetry' || medium === 'writing') {
    adjustedBaseColor = {
      h: hue,
      s: Math.min(100, baseColorHsl.s + poetrySat), // Add saturation value directly
      l: baseColorHsl.l // Keep original lightness for poetry
    };
    // Debug logging for poetry/writing
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Poetry gradient: base=${baseColorHsl.s}%, boost=${poetrySat}%, final=${adjustedBaseColor.s}%`);
    }
  } else {
    adjustedBaseColor = {
      h: hue,
      s: Math.min(100, baseColorHsl.s + otherSat), // Add saturation value directly
      l: Math.min(BASE_LIGHTNESS.otherMax, baseColorHsl.l + BASE_LIGHTNESS.otherAddition)
    };
  }
  baseColorHsl = adjustedBaseColor;

  // Set saturation and lightness based on the variant
  let saturation: number;
  let lightness: number;
  
  // Get base boost from config file
  const baseBoost = GRADIENT_SATURATION.baseBoost;

  switch (variant) {
    case 'start':
      saturation = Math.min(GRADIENT_VARIANTS.start.saturationCap, baseColorHsl.s + baseBoost);
      lightness = Math.max(GRADIENT_VARIANTS.start.lightnessMin, baseColorHsl.l + GRADIENT_VARIANTS.start.lightnessAdd);
      break;
    case 'middle':
      saturation = Math.min(GRADIENT_VARIANTS.middle.saturationCap, baseColorHsl.s + GRADIENT_VARIANTS.middle.saturationAdd);
      lightness = Math.max(GRADIENT_VARIANTS.middle.lightnessMin, baseColorHsl.l + GRADIENT_VARIANTS.middle.lightnessAdd);
      break;
    case 'end':
      saturation = Math.min(GRADIENT_VARIANTS.end.saturationCap, baseColorHsl.s + GRADIENT_VARIANTS.end.saturationAdd);
      lightness = Math.max(GRADIENT_VARIANTS.end.lightnessMin, baseColorHsl.l + GRADIENT_VARIANTS.end.lightnessAdd);
      break;
  }
  // Darken writing medium gradients a bit to give more readable contrast
  if (medium === 'writing' || medium === 'poetry') {
    // reduce lightness across variants, clamp reasonably
    lightness = Math.max(WRITING_ADJUSTMENTS.lightnessMin, Math.min(WRITING_ADJUSTMENTS.lightnessMax, lightness - WRITING_ADJUSTMENTS.lightnessDarken));
    // keep saturation a bit higher for color richness
    saturation = Math.min(100, saturation + WRITING_ADJUSTMENTS.saturationBoost);
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
  // Build a small theme fingerprint to key cache entries. Include saturation config
  // so cache invalidates when you change gradient-settings.ts
  const satFingerprint = `${GRADIENT_SATURATION.poetry}:${GRADIENT_SATURATION.audio}:${GRADIENT_SATURATION.other}:${GRADIENT_SATURATION.baseBoost}`;
  
  // In development, clear cache if saturation config changed
  if (process.env.NODE_ENV === 'development' && satFingerprint !== lastSatFingerprint) {
    gradientCache.clear();
    lastSatFingerprint = satFingerprint;
    console.log('🎨 Gradient cache cleared - new saturation settings:', GRADIENT_SATURATION);
  }
  
  const themeKey = `${(theme as any).primary || ''}|${(theme as any).complementary || ''}|${(theme as any).body || ''}|${satFingerprint}`;
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
  const color2 = getThemeCompatibleColor(baseHue + COLOR_STOP_HUE_SPACING.startToMiddle, theme, 'middle', medium);
  const color3 = getThemeCompatibleColor(baseHue + COLOR_STOP_HUE_SPACING.startToMiddle + COLOR_STOP_HUE_SPACING.middleToEnd, theme, 'end', medium);
  
  // Create a dynamic gradient pattern with softer angles for smoother transitions
  const angle = ((hash % GRADIENT_ANGLE.variationRange) + GRADIENT_ANGLE.baseAngle);
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