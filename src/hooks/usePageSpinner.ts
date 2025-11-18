import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MIN_SPINNER_MS, DEFAULT_MAX_SPINNER_MS, DEFAULT_IMAGE_THRESHOLD, SpinnerConfig } from '@/config/spinner';

interface UsePageSpinnerArgs {
  hasImages: boolean;
  potentialImageCount: number;
  config?: SpinnerConfig;
  testInstantFade?: boolean; // test override to remove fade delay
}

interface UsePageSpinnerResult {
  spinnerVisible: boolean;
  spinnerFadingOut: boolean;
  handleCardImageLoaded: () => void;
}

export function usePageSpinner({ hasImages, potentialImageCount, config, testInstantFade }: UsePageSpinnerArgs): UsePageSpinnerResult {
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [spinnerFadingOut, setSpinnerFadingOut] = useState(false);
  const [previewLoads, setPreviewLoads] = useState(0);
  const [minElapsed, setMinElapsed] = useState(false);

  const effectiveMin = config?.minMs ?? DEFAULT_MIN_SPINNER_MS;
  const effectiveMax = config?.maxMs ?? DEFAULT_MAX_SPINNER_MS;
  const effectiveThreshold = config?.imageThreshold ?? DEFAULT_IMAGE_THRESHOLD;
  const fadeMs = testInstantFade ? 0 : 400;

  const requestHide = useCallback(() => {
    if (!spinnerVisible || spinnerFadingOut) return;
    setSpinnerFadingOut(true);
    setTimeout(() => setSpinnerVisible(false), fadeMs);
  }, [spinnerVisible, spinnerFadingOut, fadeMs]);

  useEffect(() => {
    const minTimer = setTimeout(() => setMinElapsed(true), effectiveMin);
    const maxTimer = setTimeout(() => requestHide(), effectiveMax);
    return () => { clearTimeout(minTimer); clearTimeout(maxTimer); };
  }, [effectiveMin, effectiveMax, requestHide]);

  useEffect(() => {
    if (!hasImages && minElapsed) {
      requestHide();
    }
  }, [hasImages, minElapsed, requestHide]);

  const handleCardImageLoaded = useCallback(() => {
    setPreviewLoads(n => {
      const next = n + 1;
      const threshold = potentialImageCount > 0 ? Math.min(effectiveThreshold, potentialImageCount) : 0;
      if (minElapsed && ((threshold === 0 && hasImages) ? next >= 1 : (next >= threshold || next >= potentialImageCount))) {
        requestHide();
      }
      return next;
    });
  }, [minElapsed, potentialImageCount, hasImages, requestHide, effectiveThreshold]);

  return { spinnerVisible, spinnerFadingOut, handleCardImageLoaded };
}

export default usePageSpinner;
