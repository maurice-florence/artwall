// src/components/SmartImage.tsx
// Hybrid image component using Next.js Image for optimization while retaining fallback logic.
// This is a drop-in future replacement for OptimizedImage; begin migrating usage gradually.
import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import firebaseLoader from '../../lib/firebase-loader';
import { getResizedImageUrlWithFallback, getResizedImageUrl } from '@/utils/image-urls';

type SizeVariant = 'thumbnail' | 'card' | 'full' | 'original';

interface SmartImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  preferredSize?: SizeVariant;
  fallbackSrc?: string;
  // When true, uses plain <img> if Next Image causes layout issues (escape hatch)
  disableNext?: boolean;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  preferredSize = 'original',
  fallbackSrc,
  disableNext = false,
  ...imageProps
}) => {
  const [currentSrc, setCurrentSrc] = useState(() => {
    if (preferredSize === 'original') return src;
    try {
      const optimized = getResizedImageUrlWithFallback(src, preferredSize);
      return typeof optimized === 'string' ? optimized : src;
    } catch {
      return src;
    }
  });
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setAttempt(0);
    if (preferredSize === 'original') {
      setCurrentSrc(src);
    } else {
      try {
        const optimized = getResizedImageUrlWithFallback(src, preferredSize);
        setCurrentSrc(typeof optimized === 'string' ? optimized : src);
      } catch {
        setCurrentSrc(src);
      }
    }
  }, [src, preferredSize]);

  const advanceFallback = () => {
    setAttempt(a => a + 1);
    // attempt order: resized (raw), original, explicit fallback
    if (attempt === 0 && preferredSize !== 'original') {
      const rawResized = getResizedImageUrl(src, preferredSize);
      if (rawResized !== currentSrc) {
        setCurrentSrc(rawResized);
        return;
      }
    }
    if (attempt === 0 || attempt === 1) {
      if (currentSrc !== src) {
        setCurrentSrc(src);
        return;
      }
    }
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setFailed(true);
  };

  const handleError = () => advanceFallback();
  const handleLoad = () => setFailed(false);

  if (failed) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f5f5f5', color: '#666', minHeight: 200, borderRadius: 4,
        fontSize: 14
      }}>
        Afbeelding kon niet worden geladen
      </div>
    );
  }

  if (disableNext) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={currentSrc} alt={alt} onError={handleError} onLoad={handleLoad} {...imageProps} />;
  }

  // Provide modest default sizes; callers should override width/height
  return (
    <Image
      src={currentSrc}
      alt={alt}
      onError={handleError}
      onLoad={handleLoad}
      width={(imageProps as any).width || 400}
      height={(imageProps as any).height || 400}
      loading={imageProps.loading}
      placeholder="empty"
      loader={firebaseLoader}
      unoptimized={false}
      sizes={imageProps.sizes || '(max-width: 768px) 33vw, 150px'}
      {...imageProps}
    />
  );
};

export default SmartImage;