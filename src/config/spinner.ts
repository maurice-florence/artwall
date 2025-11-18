export const DEFAULT_MIN_SPINNER_MS = 800;
export const DEFAULT_MAX_SPINNER_MS = 3000;
export const DEFAULT_IMAGE_THRESHOLD = 3;

export interface SpinnerConfig {
  minMs?: number;
  maxMs?: number;
  imageThreshold?: number; // minimum distinct images before fade-out; if fewer images available use that smaller count
}
