import React, { useState, useRef } from 'react';
import { getResizedImageUrl, getResizedImageUrlWithFallback } from '@/utils/image-urls';

interface OptimizedImageProps {
  src: string;
  alt: string;
  preferredSize?: 'thumbnail' | 'card' | 'full' | 'original';
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  'data-testid'?: string;
}

/**
 * OptimizedImage component that attempts to load the best available image size
 * with graceful fallback to original if optimized versions fail to load.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  preferredSize = 'original',
  fallbackSrc,
  className,
  style,
  onClick,
  loading = 'lazy',
  'data-testid': dataTestId,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    // Try optimized version first, but fallback to original if no optimization needed
    if (preferredSize === 'original') {
      return src;
    }
    
    try {
      const optimizedUrl = getResizedImageUrlWithFallback(src, preferredSize);
      return typeof optimizedUrl === 'string' ? optimizedUrl : src;
    } catch {
      return src;
    }
  });
  const [hasError, setHasError] = useState(false);
  const attemptsRef = useRef(0);

  const handleImageError = () => {
    attemptsRef.current += 1;

    // First attempt: try the regular resized URL without fallback logic
    if (attemptsRef.current === 1 && preferredSize !== 'original') {
      const regularResizedUrl = getResizedImageUrl(src, preferredSize);
      if (regularResizedUrl !== currentSrc) {
        setCurrentSrc(regularResizedUrl);
        return;
      }
    }

    // Second attempt: try original URL
    if (attemptsRef.current <= 2 && currentSrc !== src) {
      setCurrentSrc(src);
      return;
    }

    // Third attempt: try fallback URL if provided
    if (attemptsRef.current <= 3 && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    // All attempts failed
    setHasError(true);
  };

  const handleImageLoad = () => {
    // Reset error state if image loads successfully
    setHasError(false);
  };

  if (hasError) {
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          color: '#666',
          minHeight: '200px',
          borderRadius: '4px',
          fontSize: '14px',
        }}
        data-testid={dataTestId}
      >
        <span>Afbeelding kon niet worden geladen</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      loading={loading}
      onError={handleImageError}
      onLoad={handleImageLoad}
      data-testid={dataTestId}
    />
  );
};