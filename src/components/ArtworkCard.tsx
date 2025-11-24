import React, { useState, useCallback, useMemo } from 'react';
import { FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaEllipsisH, FaImage, FaPenNib, FaCube } from 'react-icons/fa';
import styled, { useTheme } from 'styled-components';
import { Artwork, ArtworkMedium } from '@/types';
import cardSizesJson from '@/constants/card-sizes.json';
import GeneratedImage from './GeneratedImage';
import { isWritingMedium, isAudioMedium } from '../constants/medium';
import { generateUniqueGradient, shouldUseDarkText } from '@/utils/gradient-generator';
import { IMAGE_OVERLAY } from '@/config/gradient-settings';

// Removed WritingCardSVG import




interface CardSizesType {
  default: { gridColumn: number; gridRow: number };
  novel: { gridColumn: number; gridRow: number };
  prose: { gridColumn: number; gridRow: number };
  // Add other keys as needed
}
const cardSizes: CardSizesType = cardSizesJson;




// Get grid span from cardSizes.json by subtype, fallback to default
const getGridSpan = (subtype: string, medium?: ArtworkMedium) => {
  const size = (subtype in cardSizes ? (cardSizes as any)[subtype] : cardSizes['default']);
  return `grid-column: span ${size.gridColumn}; grid-row: span ${size.gridRow};`;
};

const CardContainer = styled.div<{ $medium: ArtworkMedium; $subtype?: string; $blank?: boolean }>`
  perspective: 1000px;
  width: 100%;
  max-width: 150px;
  aspect-ratio: 3/4;
  border-radius: 6px;
  ${props => getGridSpan(props.$subtype || 'default', props.$medium)}
  font-size: 0.7rem;
  position: relative;
  /* Ensure container maintains its height */
  min-height: 0;

  @media (max-width: 768px) {
    grid-column: span 1;
    grid-row: span 1;
    min-width: 0;
    max-width: 100vw;
    min-height: 60px;
    font-size: 0.65rem;
    aspect-ratio: 4 / 5; /* keep consistent sizing across orientation */
  }
`;

const CardInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform-origin: center center;
  cursor: pointer;
  /* Prevent any margin collapse or spacing issues */
  margin: 0;
  padding: 0;
  
  /* Only enable flip on devices that support hover and precise pointer */
  @media (hover: hover) and (pointer: fine) {
    ${CardContainer}:hover & {
      transform: rotateY(180deg);
    }
  }
`;

const CardFace = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
`;

// Use a transient prop ($medium) to avoid passing it to the DOM
const CardFront = styled(CardFace)<{ 
  $medium: ArtworkMedium; 
  $imageUrl?: string; 
  $isWriting?: boolean; 
  $isAudio?: boolean;
  $gradient?: string;
  $useDarkText?: boolean;
}>`
  position: relative;
  background: ${({ theme, $imageUrl, $isWriting, $isAudio, $gradient, $medium }) => 
    $gradient ? $gradient :
    // Only use background images for paper textures, not actual images
    ($isWriting && !$imageUrl) ? `url('/paper1.jpg')` : 
    ($isAudio && !$imageUrl) ? `url('/paper2.png')` : 
  // If no image/gradient, use solid colors
  ($medium === 'writing') ? theme.primary :
  ($medium === 'audio') ? theme.secondary :
    theme.cardBg
  };
  background-size: cover;
  background-position: center;
  color: ${({ theme, $useDarkText }) => $useDarkText ? theme.text : theme.cardText};
  transition: background 220ms ease, color 160ms ease;
  padding: 0.7rem;
  font-size: 0.75rem;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    padding: 0.4rem;
    font-size: 0.65rem;
  }
`;

const CardBack = styled(CardFace)<{ $medium: ArtworkMedium }>`
  background: ${({ theme, $medium }) => {
    if ($medium === 'audio') return theme.secondary;
    if ($medium === 'writing') return theme.primary;
    if ($medium === 'drawing' || $medium === 'sculpture') return theme.tertiary;
    return theme.primary; // fallback
  }};
  transform: rotateY(180deg);
  padding: 0.7rem;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 0.7rem;
  /* border removed */
  box-sizing: border-box;
  @media (max-width: 768px) {
    padding: 0.4rem;
    font-size: 0.6rem;
  }
`;

const TitleOverlay = styled.div`
    background: rgba(0,0,0,0.4);
    padding: 0.5rem;
    border-radius: 4px;
`;

const CardTitle = styled.h3`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1.1rem;
  margin: 0;
  font-weight: bold;
  color: ${({ theme }) => theme.cardText};
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  opacity: 0.9;
  background: transparent;
  padding: 0.5rem;
  border-radius: 4px;
  color: ${({ theme }) => theme.cardText};
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.4rem;
  }
`;

const CardBackTitle = styled(CardTitle)`
    color: ${({ theme }) => theme.body};
`;

const CardBackFooter = styled(CardFooter)`
  color: ${({ theme }) => theme.body};
`;

const CardCategory = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AudioIconOverlay = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: 50%;
  padding: 0.5rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardImage = styled.img<{ $fillAvailable?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.35s ease;
  &.loaded {
    opacity: 1;
  }
`;

const ImageSkeleton = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 37%, #e0e0e0 63%);
  background-size: 400% 100%;
  animation: shimmer 1.2s ease-in-out infinite;
  transition: opacity 0.35s ease;
  &.fade-out { opacity: 0; }
  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: 0 0; }
  }
`;

const ImageGradientOverlay = styled.div<{ $bg: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  pointer-events: none;
  z-index: 1; /* above image, below any explicit overlays */
  background: ${({ $bg }) => $bg};
`;

const ProzaImage = styled.img`
  width: 100%;
  height: auto;
  min-height: 0;
  min-width: 0;
  object-fit: contain;
  margin: 0;
  display: block;
`;

// Match header icons for medium categories
const iconMap: { [key: string]: React.JSX.Element } = {
  poetry: <FaPenNib />,
  prose: <FaBookOpen />,
  prosepoetry: <FaAlignLeft />,
  writing: <FaPenNib />,
  audio: <FaMusic />,
  song: <FaMusic />,
  drawing: <FaPaintBrush />,
  sculpture: <FaCube />,
  other: <FaEllipsisH />,
};

// Helper to get the correct icon for a card
const getArtworkIcon = (artwork: Artwork) => {
  // Prefer subtype-specific icon if available
  if (artwork.subtype && iconMap[artwork.subtype.toLowerCase()]) {
    return iconMap[artwork.subtype.toLowerCase()];
  }
  // Fallback to medium icon
  return iconMap[artwork.medium] || iconMap['other'];
};

const isImageUrl = (url: string) => {
  return /\.(jpeg|jpg|gif|png)$/.test(url);
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
};

// Import the image URL utility
import { getResizedImageUrl as getImageUrl } from '@/utils/image-urls';
import Image from 'next/image';

interface ArtworkCardProps {
    artwork: Artwork;
    onSelect: () => void;
    isAdmin?: boolean;
  onImageLoaded?: () => void;
}

const LanguageIndicator = styled.div`
  display: flex;
  gap: 0.25rem;
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 0.25rem;
`;

const LanguageTag = styled.span`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accentText};
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 500;
`;

const TextOverlay = styled.div<{ $subtle?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: ${props => props.$subtle ? '10px' : '14px'};
  line-height: 1.5;
  color: ${props => props.$subtle ? 'rgba(0, 0, 0, 0.15)' : '#333'};
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  pointer-events: none;
`;

const AudioTextOverlay = styled(TextOverlay)`
  font-family: sans-serif;
`;

const ArtworkCard = ({ artwork, onSelect, isAdmin, onImageLoaded }: ArtworkCardProps) => {
    const theme = useTheme();

    // Card sizing logic: only 'novels' and 'songs' get special sizing, all others use standard size
    const formattedDate = new Date(artwork.year, (artwork.month || 1) - 1, artwork.day || 1)
      .toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });

    // Language indicator rendering (fix duplicate key error)
    const availableLanguages: string[] = [];
    if (artwork.language1 && artwork.language1.trim() !== '') availableLanguages.push(artwork.language1);
    if (artwork.language2 && artwork.language2.trim() !== '') availableLanguages.push(artwork.language2);
    if (artwork.language3 && artwork.language3.trim() !== '') availableLanguages.push(artwork.language3);
    // Helper to generate unique key for language tags, even for empty or duplicate codes
    const getLangKey = (lang: string, idx: number) => {
      const safeLang = (lang || '').trim();
      if (!safeLang) return `empty-${idx}`;
      // Add index to all keys to guarantee uniqueness
      return `${safeLang}-${idx}`;
    };

    // Use subtype for sizing, default to drawing size
    const subtype = (artwork.subtype || '').toLowerCase();

    // Determine which text to show on card back: description or content
    // Only show description on back, never on front
    const hasDescription = artwork.description && artwork.description.trim() !== '';
    // If using content, replace <br> with newlines, then strip other HTML tags
    const stripHtml = (html: string) =>
      html
        .replace(/<br\s*\/?>/gi, '\n') // Replace <br> and <br/> with newlines
        .replace(/<[^>]+>/g, ''); // Remove all other HTML tags

    // Remove the title from the first line of content if present
    const removeTitleFromContent = (content: string, title: string) => {
      const lines = content.split(/\r?\n/);
      // If the first line matches the title (case-insensitive, trimmed), and the second line is empty, remove both
      if (
        lines.length > 2 &&
        lines[0].trim().toLowerCase() === title.trim().toLowerCase() &&
        lines[1].trim() === ''
      ) {
        return lines.slice(2).join('\n');
      }
      return content;
    };

    // Only show description or cleaned content (without embedded date/place)
    const cardText = hasDescription
      ? artwork.description.trim()
      : (artwork.content
          ? removeTitleFromContent(stripHtml(artwork.content), artwork.title || '').trim()
          : '');
    // Date/place are now only shown from metadata below, not from cardText.

    // Calculate max lines based on card size (default: 8, novel: 16, song: 10)
    let maxLines = 8;
    if (subtype === 'novel') maxLines = 16;

    // Accept either a single string or an array of strings for images
    let images: string[] = [];
    if (Array.isArray(artwork.coverImageUrl)) {
      images = artwork.coverImageUrl.filter(isImageUrl);
    } else if (artwork.coverImageUrl && isImageUrl(artwork.coverImageUrl)) {
      images = [artwork.coverImageUrl];
    } else if (Array.isArray(artwork.mediaUrls) && artwork.mediaUrls.length > 0) {
      images = artwork.mediaUrls.filter(isImageUrl);
    }

    // For audio: get the first available mediaUrl (mediaUrl or mediaUrls)
    let audioUrl: string | undefined = undefined;
    if (artwork.mediaUrl) {
      audioUrl = artwork.mediaUrl;
    } else if (Array.isArray(artwork.mediaUrls) && artwork.mediaUrls.length > 0) {
      audioUrl = artwork.mediaUrls.find(url => !isImageUrl(url));
    }

    // Determine base booleans before hooks
    const isWriting = isWritingMedium(artwork.medium);
    const isAudio = isAudioMedium(artwork.medium);
    const hasImage = images.length > 0;

    // Hooks must be declared before any early returns
    // Slider state for all cards with images, only on card back
  const [currentImage, setCurrentImage] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

    const uniqueGradient = useMemo(() => {
      // Generate gradient for all cards
      return generateUniqueGradient(artwork.id || artwork.title, theme, artwork.medium);
    }, [artwork.id, artwork.title, artwork.medium, theme]);

    const useDarkText = useMemo(() => {
      return uniqueGradient ? shouldUseDarkText(uniqueGradient) : false;
    }, [uniqueGradient]);

    // Ensure poetry/writing cards open modal on tap (mobile-friendly)
    const [showPreview, setShowPreview] = useState(false);
    const handleFrontClick = useCallback((e: React.MouseEvent) => {
      if (isWriting && !hasImage) {
        // Open the modal immediately and prevent duplicate parent click
        e.stopPropagation();
        onSelect();
        return;
      }
      // For non-writing cards, allow parent container onClick to handle selection
    }, [isWriting, hasImage, onSelect]);

    // Determine image URL for overlay computation
    // Card front preview: use 'card' size for grid cards (test expects this)
    const imageUrl = hasImage ? getImageUrl(images[0], 'card') : undefined;
    // Card inside/back: use medium/full size
    const imageUrlMedium = hasImage ? getImageUrl(images[0], 'full') : undefined;
    // Full screen: use original
    const imageUrlOriginal = hasImage ? getImageUrl(images[0], 'original') : undefined;

    // Build a theme-based gradient overlay for images when enabled (must be before any returns)
    const imageOverlayBg = useMemo(() => {
      if (!IMAGE_OVERLAY.enabled || !imageUrl) return '';
      const colorHex = (theme as any)[IMAGE_OVERLAY.colorSource] as string;
      // Convert #RRGGBB to rgba
      const hex = colorHex?.replace('#', '');
      if (!hex || (hex.length !== 6 && hex.length !== 3)) return '';
      const expand = (h: string) => (h.length === 3 ? h.split('').map(c => c + c).join('') : h);
      const full = expand(hex);
      const r = parseInt(full.substring(0, 2), 16);
      const g = parseInt(full.substring(2, 4), 16);
      const b = parseInt(full.substring(4, 6), 16);
      const startA = Math.max(0, Math.min(100, IMAGE_OVERLAY.startOpacity)) / 100;
      const endA = Math.max(0, Math.min(100, IMAGE_OVERLAY.endOpacity)) / 100;
      return `linear-gradient(${IMAGE_OVERLAY.angle}deg, rgba(${r}, ${g}, ${b}, ${startA}) 0%, rgba(${r}, ${g}, ${b}, ${endA}) 100%)`;
    }, [imageUrl, theme]);

    // Early return must happen after all hooks
    const blank = !artwork.title && !artwork.description && !artwork.coverImageUrl;
    if (blank) {
      return null;
    }

    const start = Math.floor(cardText.length / 3);
    const textPreview = cardText.slice(start);

    // Card front: only show title, image/waveform, language, and footer. No extra text under the title for any medium.
    return (
      <CardContainer $medium={artwork.medium} $subtype={subtype} onClick={onSelect} data-testid={`artwork-card-${artwork.id}`}>
        <CardInner data-flip={typeof window !== 'undefined' && window.matchMedia ? (window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'hover-only' : 'disabled') : 'disabled'}>
          <CardFront 
            $medium={artwork.medium} 
            $imageUrl={imageUrl} 
            $isWriting={isWriting} 
            $isAudio={isAudio}
            $gradient={uniqueGradient}
            $useDarkText={useDarkText}
            onClick={handleFrontClick}
          >
            {/* Card front: only show gradient background, no content preview */}
          </CardFront>
            <CardBack $medium={artwork.medium}>
              <CardBackTitle>{artwork.title}</CardBackTitle>
              <CardBackFooter style={{flexDirection: 'column' }}>
                {/* Only show date/place from metadata fields */}
                <span>{formattedDate}</span>
                {artwork.location1 && <span>{artwork.location1}</span>}
                <CardCategory>
                  {getArtworkIcon(artwork)}
                </CardCategory>
              </CardBackFooter>
            </CardBack>
        </CardInner>
      </CardContainer>
    );
    // (remove duplicate declaration)

    // availableLanguages already declared above
};
const DeleteButton = styled.button`
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  align-self: flex-end;
  transition: background 0.2s;
  &:hover {
    background: #c0392b;
  }
`;

export { CardContainer };
export default ArtworkCard;

