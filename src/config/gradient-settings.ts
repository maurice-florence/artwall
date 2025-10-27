/**
 * Gradient Configuration
 * 
 * Centralized configuration for all gradient generation settings.
 * Adjust these values to control the appearance of card gradients.
 * 
 * COLOR SYSTEM:
 * The app uses a triadic color scheme with 3 primary colors:
 * - PRIMARY: Used for poetry/writing cards (default: teal #0b8783)
 * - SECONDARY: Used for audio/music cards (default: coral-red #E85D4F) 
 * - TERTIARY: Used for visual arts - drawing/sculpture (default: amber #F4A742)
 * - INACTIVE: Desaturated primary for disabled buttons/UI (default: gray-teal #94A3A8)
 * 
 * This creates visual distinction between content types while maintaining
 * a cohesive, aesthetically pleasing palette based on color theory.
 */

export const GRADIENT_SATURATION = {
  /** Poetry and Writing cards saturation boost (Default: 40, Range: 0-100) */
  poetry: 30,
  /** Audio and Music cards saturation boost (Default: 30, Range: 0-100) */
  audio: 30,
  /** Other media types saturation boost (Default: 20, Range: 0-100) */
  other: 20,
  /** Base boost applied to gradient start colors (Default: 15, Range: 0-50) */
  baseBoost: 25,
};

export const HUE_VARIATION = {
  /** Audio/Music hue variation range (Default: 25, Range: 0-60) */
  audio: 25,
  /** Poetry/Writing hue variation range (Default: 20, Range: 0-60) */
  poetry: 40,
  /** Other media hue variation range (Default: 30, Range: 0-60) */
  other: 30,
};

export const BASE_SATURATION_MULTIPLIER = {
  /** Poetry/Writing base saturation multiplier (Default: 1.1, Range: 0.5-2.0) */
  poetry: 1,
  /** Audio/Music base saturation multiplier (Default: 1.4, Range: 0.5-2.0) */
  audio: 1,
  /** Other media base saturation multiplier (Default: 1.2, Range: 0.5-2.0) */
  other: 1,
};

export const BASE_LIGHTNESS = {
  /** Poetry/Writing lightness multiplier (Default: 1.1, Range: 0.5-1.5) */
  poetryMultiplier: 0.1,
  /** Poetry/Writing max lightness cap (Default: 65, Range: 40-90) */
  poetryMax: 15,
  /** Audio/Music lightness multiplier (Default: 0.9, Range: 0.5-1.5) */
  audioMultiplier: 0.9,
  /** Audio/Music min lightness floor (Default: 45, Range: 20-70) */
  audioMin: 45,
  /** Other media lightness addition (Default: 10, Range: 0-30) */
  otherAddition: 10,
  /** Other media max lightness cap (Default: 95, Range: 60-100) */
  otherMax: 95,
};

export const GRADIENT_VARIANTS = {
  start: {
    /** Max saturation cap (Default: 85, Range: 50-100) */
    saturationCap: 15,
    /** Lightness addition (Default: 5, Range: 0-20) */
    lightnessAdd: 25,
    /** Min lightness floor (Default: 75, Range: 50-90) */
    lightnessMin: 75,
  },
  middle: {
    /** Saturation addition (Default: 10, Range: 0-30) */
    saturationAdd: 10,
    /** Max saturation cap (Default: 70, Range: 40-100) */
    saturationCap: 70,
    /** Lightness addition (Default: 10, Range: 0-30) */
    lightnessAdd: 10,
    /** Min lightness floor (Default: 80, Range: 50-95) */
    lightnessMin: 80,
  },
  end: {
    /** Saturation addition (Default: 5, Range: 0-20) */
    saturationAdd: 25,
    /** Max saturation cap (Default: 55, Range: 30-100) */
    saturationCap: 55,
    /** Lightness addition (Default: 15, Range: 0-40) */
    lightnessAdd: 15,
    /** Min lightness floor (Default: 85, Range: 60-100) */
    lightnessMin: 85,
  },
};

export const WRITING_ADJUSTMENTS = {
  /** Lightness reduction for better text contrast (Default: 12, Range: 0-30) */
  lightnessDarken: 12,
  /** Min lightness floor after darkening (Default: 30, Range: 20-60) */
  lightnessMin: 30,
  /** Max lightness cap after darkening (Default: 85, Range: 60-100) */
  lightnessMax: 85,
  /** Additional saturation boost for color richness (Default: 6, Range: 0-20) */
  saturationBoost: 6,
};

export const GRADIENT_ANGLE = {
  /** Base angle offset (Default: 135 diagonal, Range: 0-360) */
  baseAngle: 135,
  /** Maximum random variation in angle (Default: 90, Range: 0-180) */
  variationRange: 90,
};

export const COLOR_STOP_HUE_SPACING = {
  /** Hue difference between start and middle (Default: 25, Range: 0-60) */
  startToMiddle: 75,
  /** Hue difference between middle and end (Default: 25, Range: 0-60) */
  middleToEnd: 25,
};

export const IMAGE_OVERLAY = {
  /** Enable/disable overlay for drawing cards (Default: true) */
  enabled: true,
  /** Gradient angle for overlay (Default: 135, Range: 0-360) */
  angle: 135,
  /** Start opacity in percentage (Default: 25, Range: 0-100) */
  startOpacity: 65,
  /** End opacity in percentage (Default: 12.5, Range: 0-100) */
  endOpacity: 12.5,
  /** Color to use for overlay - 'tertiary', 'secondary', or 'primary' (Default: 'tertiary') */
  colorSource: 'tertiary' as 'tertiary' | 'secondary' | 'primary',
};
