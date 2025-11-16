// Central breakpoint definitions for responsive design
export const breakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const mq = {
  up: (key: keyof typeof breakpoints) => `@media (min-width: ${breakpoints[key]}px)`,
  down: (key: keyof typeof breakpoints) => `@media (max-width: ${breakpoints[key] - 0.02}px)`, // subtract tiny fraction to avoid overlap
};

export const isClient = typeof window !== 'undefined';

export function isMobileWidth(width: number = isClient ? window.innerWidth : breakpoints.md): boolean {
  return width < breakpoints.md;
}
