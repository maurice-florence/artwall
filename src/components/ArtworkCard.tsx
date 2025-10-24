import React, { useState } from 'react';
import { FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaEllipsisH, FaImage, FaPenNib, FaCube } from 'react-icons/fa';
import styled, { useTheme } from 'styled-components';
import { Artwork, ArtworkMedium } from '@/types';
import cardSizesJson from '@/constants/card-sizes.json';
import GeneratedImage from './GeneratedImage';

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
  max-width: 480px;
  border-radius: 10px;
  ${props => getGridSpan(props.$subtype || 'default', props.$medium)}

  font-size: 0.75rem;

  @media (max-width: 768px) {
    grid-column: span 2;
    grid-row: span 1;
    min-width: 0;
    max-width: 100vw;
    min-height: 80px;
    font-size: 0.7rem;
  }
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;

  ${CardContainer}:hover & {
    transform: rotateY(180deg);
  }
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  max-width: 480px;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Use a transient prop ($medium) to avoid passing it to the DOM
const CardFront = styled(CardFace)<{ $medium: ArtworkMedium; $imageUrl?: string; $isWriting?: boolean; $isAudio?: boolean }>`
  background: ${({ theme, $imageUrl, $isWriting, $isAudio }) => ($isWriting && !$imageUrl) ? `url('/paper1.jpg')` : ($isAudio && !$imageUrl) ? `url('/paper2.png')` : $imageUrl ? `url(${$imageUrl})` : theme.cardBg};
  background-size: cover;
  background-position: center;
  color: ${({ theme }) => theme.cardText};
  padding: 0.7rem;
  font-size: 0.75rem;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
`;

const CardBack = styled(CardFace)`
  background: ${({ theme }) => theme.primary};
  transform: rotateY(180deg);
  padding: 0.7rem;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 0.7rem;
  /* border removed */
  box-sizing: border-box;
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
  border-radius: 8px;
  margin-bottom: 0.5rem;
  ${props => props.$fillAvailable ? `
    flex: 1 1 auto;
    height: auto;
    min-height: 0;
    min-width: 0;
    object-fit: contain;
    max-height: 180px;
    align-self: stretch;
  ` : `
    height: 180px;
    object-fit: contain;
    max-height: 180px;
  `}
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

const getResizedImageUrl = (url: string, width: number, height: number) => {
  if (!url) return '';
  const extensionIndex = url.lastIndexOf('.');
  if (extensionIndex === -1) return url; // No extension found

  const filename = url.slice(0, extensionIndex);
  const extension = url.slice(extensionIndex);
  
  // Check if there are query parameters
  const queryIndex = extension.indexOf('?');
  if (queryIndex !== -1) {
    const ext = extension.slice(0, queryIndex);
    const query = extension.slice(queryIndex);
    return `${filename}_${width}x${height}${ext}${query}`;
  }

  return `${filename}_${width}x${height}${extension}`;
};

interface ArtworkCardProps {
    artwork: Artwork;
    onSelect: () => void;
    isAdmin?: boolean;
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

const TextOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
`;

const AudioTextOverlay = styled(TextOverlay)`
  font-family: sans-serif;
`;

const ArtworkCard = ({ artwork, onSelect, isAdmin }: ArtworkCardProps) => {
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

    const cardText = hasDescription
      ? artwork.description.trim()
      : (artwork.content
          ? removeTitleFromContent(stripHtml(artwork.content), artwork.title || '').trim()
          : '');

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


    // Slider state for all cards with images, only on card back
    const [currentImage, setCurrentImage] = useState(0);

    // Blank card rendering
    const blank = !artwork.title && !artwork.description && !artwork.coverImageUrl;
    if (blank) {
      return null;
    }

    const isWriting = artwork.medium === 'writing';
    const isAudio = artwork.medium === 'audio';
    const hasImage = images.length > 0;
    const imageUrl = hasImage ? getResizedImageUrl(images[0], 480, 480) : undefined;

    const start = Math.floor(cardText.length / 3);
    const textPreview = cardText.slice(start);

    // Card front: only show title, image/waveform, language, and footer. No extra text under the title for any medium.
    return (
      <CardContainer $medium={artwork.medium} $subtype={subtype} onClick={onSelect} data-testid={`artwork-card-${artwork.id}`}>
        <CardInner>
          <CardFront $medium={artwork.medium} $imageUrl={imageUrl} $isWriting={isWriting} $isAudio={isAudio}>
            {(isWriting || isAudio) && !hasImage ? (
              isWriting ? (
                <TextOverlay>{textPreview}</TextOverlay>
              ) : (
                <AudioTextOverlay>{textPreview}</AudioTextOverlay>
              )
            ) : !imageUrl && (
              <>
                <div style={{ borderRadius: 4, marginBottom: '0.5rem', flexShrink: 0 }}>
                  <CardTitle data-testid={`artwork-title-${artwork.id}`}>{artwork.title}</CardTitle>
                </div>
                {/* Image or waveform, always between title and footer */}
                <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                  <GeneratedImage title={artwork.title || ''} medium={artwork.medium} />
                </div>
                {availableLanguages.length > 1 && (
                  <LanguageIndicator data-testid={`artwork-languages-${artwork.id}`}> 
                    {availableLanguages.filter((lang: string) => lang && lang.trim() !== '').map((lang: string, idx: number) => (
                      <LanguageTag key={getLangKey(lang, idx)}>{lang.toUpperCase()}</LanguageTag>
                    ))}
                  </LanguageIndicator>
                )}
                <CardFooter style={{ marginTop: '0.5rem', justifyContent: 'space-between', flexShrink: 0 }}>
                  <span>{formattedDate}</span>
                  <CardCategory>
                    {getArtworkIcon(artwork)}
                  </CardCategory>
                </CardFooter>
              </>
            )}
          </CardFront>
          <CardBack>
            <CardBackTitle>{artwork.title}</CardBackTitle>
            <CardBackFooter style={{flexDirection: 'column' }}>
              <span>{formattedDate}</span>
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
