export {};

declare global {
  interface Window {
    __ALL_ARTWORKS__?: import('./types').Artwork[];
  }
}
