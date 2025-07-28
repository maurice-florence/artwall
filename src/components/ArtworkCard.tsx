import React, { useState } from 'react';
import { FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaEllipsisH, FaImage, FaPenNib, FaCube } from 'react-icons/fa';
import styled, { useTheme } from 'styled-components';
import { Artwork, ArtworkMedium } from '@/types';
import cardSizesJson from '@/constants/card-sizes.json';

// Top-level GeneratedTextLinesSVG for poetry/prosepoetry: lines of text
const GeneratedTextLinesSVG: React.FC<{ width?: number; height?: number; lines?: number }> = ({ width = 120, height = 48, lines = 6 }) => {
  const theme = useTheme();
  const lineSpacing = height / (lines + 1);
  const minLen = width * 0.4;
  const maxLen = width * 0.9;
  const accent = theme.accent || '#1F618D';
  const bg = theme.cardBg || '#fff';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
      <rect x="0" y="0" width={width} height={height} fill={bg} />
      {Array.from({ length: lines }).map((_, i) => {
        // Randomize line length and y offset for a hand-drawn feel
        const len = minLen + Math.random() * (maxLen - minLen);
        const y = lineSpacing * (i + 1) + (Math.random() - 0.5) * 2;
        return (
          <rect
            key={i}
            x={width * 0.05}
            y={y}
            width={len}
            height={4 + Math.random() * 2}
            rx={2}
            fill={accent}
            opacity={0.7 + Math.random() * 0.2}
          />
        );
      })}
    </svg>
  );
};




interface CardSizesType {
  default: { gridColumn: number; gridRow: number };
  novel: { gridColumn: number; gridRow: number };
  song: { gridColumn: number; gridRow: number };
  // Add other keys as needed
}
const cardSizes: CardSizesType = cardSizesJson;





// Get grid span from cardSizes.json by subtype, fallback to default
const getGridSpan = (subtype: string, medium?: ArtworkMedium) => {
  if (medium === 'audio') {
    // Always use 'song' size for all audio cards
    const size = cardSizes['song'];
    return `grid-column: span ${size.gridColumn}; grid-row: span ${size.gridRow};`;
  }
  const size = (subtype in cardSizes ? (cardSizes as any)[subtype] : cardSizes['default']);
  return `grid-column: span ${size.gridColumn}; grid-row: span ${size.gridRow};`;
};

const CardContainer = styled.div<{ $medium: ArtworkMedium; $subtype?: string; $blank?: boolean }>`
  perspective: 1000px;
  width: 100%;
  max-width: 480px;
  border-radius: 10px;
  /* Remove explicit height, let grid control it */
  ${props => getGridSpan(props.$subtype || 'default', props.$medium)}
  min-height: 110px;
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
const CardFront = styled(CardFace)<{ $medium: ArtworkMedium }>`
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.cardText};
  padding: 0.7rem;
  font-size: 0.75rem;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
`;

const CardBack = styled(CardFace)`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accentText};
  transform: rotateY(180deg);
  padding: 0.7rem;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 0.7rem;
  /* border removed */
  box-sizing: border-box;

  .card-back-content {
    flex: 1 1 100%;
    width: 100%;
    max-height: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: var(--max-lines, 8);
    -webkit-box-orient: vertical;
    white-space: pre-line;
    text-overflow: ellipsis;
    word-break: break-word;
    position: relative;
    padding: 0;
    margin: 0;
    font-size: 0.9em;
    align-items: stretch;
    justify-content: flex-start;
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

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
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
    if (subtype === 'song') maxLines = 10;

    // Accept either a single string or an array of strings for images
    let images: string[] = [];
    if (Array.isArray(artwork.coverImageUrl)) {
      images = artwork.coverImageUrl;
    } else if (artwork.coverImageUrl) {
      images = [artwork.coverImageUrl];
    } else if (Array.isArray(artwork.mediaUrls) && artwork.mediaUrls.length > 0) {
      images = artwork.mediaUrls;
    }

    // For audio: get the first available mediaUrl (mediaUrl or mediaUrls)
    let audioUrl: string | undefined = undefined;
    if (artwork.mediaUrl) {
      audioUrl = artwork.mediaUrl;
    } else if (Array.isArray(artwork.mediaUrls) && artwork.mediaUrls.length > 0) {
      audioUrl = artwork.mediaUrls[0];
    }


    // Generate a random bar waveform SVG as a React component
    const RandomBarWaveform: React.FC<{ width?: number; height?: number; bars?: number }> = ({ width = 180, height = 48, bars = 48 }) => {
      const barWidth = width / bars;
      const barsArray = Array.from({ length: bars }, (_, i) => {
        const base = Math.sin((i / (bars - 1)) * Math.PI * 2) * 0.5 + 0.5;
        const noise = (Math.random() - 0.5) * 0.7 + (Math.random() - 0.5) * 0.5;
        const mixed = 0.5 * base + 0.5 * (0.5 + noise);
        const barHeight = Math.max(4, Math.min(height, mixed * height * (0.7 + Math.random() * 0.7)));
        return barHeight;
      });
      const waveColor = theme.accent || '#1F618D';
      const bgColor = theme.cardBg || '#fff';
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }}>
          <rect x="0" y="0" width={width} height={height} fill={bgColor} />
          {barsArray.map((barHeight, i) => {
            const x = i * barWidth + barWidth / 2;
            const y = (height - barHeight) / 2;
            return (
              <rect
                key={i}
                x={x - barWidth / 4}
                y={y}
                width={barWidth / 2}
                height={barHeight}
                rx={barWidth / 6}
                fill={waveColor}
                opacity={0.85}
              />
            );
          })}
        </svg>
      );
    };

    // Generate a random abstract figure SVG for drawing/sculpture
    const RandomFigureSVG: React.FC = () => {
      const width = 120;
      const height = 60;
      const figureColor = theme.accent || '#1F618D';
      const bgColor = theme.cardBg || '#fff';
      // All shapes will fit within the SVG bounds (0,0)-(120,60)
      // Random ellipses
      const ellipses = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, (_, i) => {
        const rx = 20 + Math.random() * 30; // max 50
        const ry = 10 + Math.random() * 20; // max 30
        const cx = rx + Math.random() * (width - 2 * rx); // always inside
        const cy = ry + Math.random() * (height - 2 * ry); // always inside
        const rot = Math.random() * 360;
        return (
          <ellipse
            key={`ellipse-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={figureColor}
            opacity={0.18 + Math.random() * 0.18}
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        );
      });
      // Random lines
      const lines = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, (_, i) => {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = Math.random() * width;
        const y2 = Math.random() * height;
        return (
          <line
            key={`line-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={figureColor}
            strokeWidth={2 + Math.random() * 3}
            opacity={0.4 + Math.random() * 0.3}
            strokeLinecap="round"
          />
        );
      });
      // Random polygon (triangle or quad)
      const nPoints = 3 + Math.floor(Math.random() * 2);
      const points = Array.from({ length: nPoints }, () => {
        const x = 10 + Math.random() * (width - 20);
        const y = 10 + Math.random() * (height - 20);
        return `${x},${y}`;
      }).join(' ');
      return (
        <svg
          viewBox="0 0 120 60"
          width="100%"
          height="100%"
          style={{ display: 'block', width: '100%', height: '100%' }}
          preserveAspectRatio="none"
        >
          <rect x="0" y="0" width={120} height={60} fill={bgColor} />
          {ellipses}
          {lines}
          <polygon points={points} fill={figureColor} opacity={0.22 + Math.random() * 0.18} />
        </svg>
      );
    };

    // Slider state for all cards with images, only on card back
    const [currentImage, setCurrentImage] = useState(0);

    // Blank card rendering
    const blank = !artwork.title && !artwork.description && !artwork.coverImageUrl;
    if (blank) {
      return null;
    }

    // Card front: only show title, image/waveform, language, and footer. No extra text under the title for any medium.
    return (
      <CardContainer $medium={artwork.medium} $subtype={subtype} onClick={onSelect} data-testid={`artwork-card-${artwork.id}`}>
        <CardInner>
          <CardFront $medium={artwork.medium}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ borderRadius: 4, marginBottom: '0.5rem', flexShrink: 0 }}>
                <CardTitle data-testid={`artwork-title-${artwork.id}`}>{artwork.title}</CardTitle>
              </div>
              {/* Image or waveform, always between title and footer */}
              <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
                {artwork.medium === 'audio' ? (
                  <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RandomBarWaveform width={180} height={48} bars={48} />
                  </div>
                ) : artwork.medium === 'writing' && subtype === 'novel' && images.length > 0 ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                    <img 
                      src={images[0]} 
                      alt={artwork.title || 'cover'} 
                      style={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain',
                        borderRadius: 4,
                        display: 'block',
                      }}
                    />
                  </div>
                ) : artwork.medium === 'writing' && (subtype === 'poetry' || subtype === 'prosepoetry') ? (
                  <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                    <GeneratedTextLinesSVG width={120} height={48} lines={6} />
                  </div>
                ) : artwork.medium === 'writing' ? (
                  <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                    <FaAlignLeft size={26} color={theme.accent || '#1F618D'} />
                  </div>
                ) : images.length > 0 ? (
                  <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                    <FaImage size={26} color={theme.accent || '#1F618D'} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, padding: 0 }}>
                    <FaImage size={26} color={theme.accent || '#1F618D'} />
                  </div>
                )}
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
            </div>
          </CardFront>
          <CardBack>
            <div
              className="card-back-content"
              data-testid={`artwork-back-content-${artwork.id}`}
              style={{
                maxHeight: `${maxLines * 1.25}em`,
                WebkitLineClamp: maxLines,
                '--max-lines': maxLines,
              } as React.CSSProperties}
            >
              {cardText}
            </div>
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
