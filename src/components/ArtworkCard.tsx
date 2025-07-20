import React from 'react';
import { FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft } from 'react-icons/fa';
import styled, { useTheme } from 'styled-components';
import { Artwork, ArtworkMedium } from '@/types';
import cardSizesJson from '@/constants/card-sizes.json';

type CardSizesType = {
  [key: string]: { gridColumn: number; gridRow: number };
};
const cardSizes: CardSizesType = cardSizesJson;

interface CardContainerProps {
  medium: ArtworkMedium;
}


// Get grid span from cardSizes.json by subtype, fallback to default
const getGridSpan = (subtype: string) => {
  const size = cardSizes[subtype] || cardSizes['default'];
  return `grid-column: span ${size.gridColumn}; grid-row: span ${size.gridRow};`;
};

const CardContainer = styled.div<CardContainerProps & { $subtype?: string; $blank?: boolean }>`
  perspective: 1000px;
  width: 100%;
  border-radius: 12px;
  /* Remove explicit height, let grid control it */
  ${({ $subtype }) => getGridSpan($subtype || 'default')}

  @media (max-width: 768px) {
      grid-column: span 2;
      grid-row: span 1;
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
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// Use a transient prop ($coverImageUrl) to avoid passing it to the DOM
const CardFront = styled(CardFace)<{ medium: ArtworkMedium }>`
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.cardText};
  padding: 1.5rem;
  justify-content: space-between;
  display: flex;
  flex-direction: column;
`;

const CardBack = styled(CardFace)`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accentText};
  transform: rotateY(180deg);
  padding: 1.5rem;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 0.9rem;
`;

const TitleOverlay = styled.div`
    background: rgba(0,0,0,0.4);
    padding: 0.5rem;
    border-radius: 4px;
`;

const CardTitle = styled.h3`
  font-family: 'Lora', serif;
  font-size: 1.3rem;
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
  flex: 1 1 auto;
  height: 0;
  min-height: 0;
  min-width: 0;
  object-fit: contain;
  margin: 0;
  display: block;
`;

const iconMap: { [key in ArtworkMedium]?: React.JSX.Element } = {
  writing: <FaBookOpen />,
  audio: <FaMusic />,
  drawing: <FaPaintBrush />,
  sculpture: <FaPaintBrush />,
  other: <FaAlignLeft />,
};

// Add a helper to get the correct icon for audio
const getArtworkIcon = (artwork: Artwork) => {
  return iconMap[artwork.medium] || null;
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
    // Helper to generate unique key for language tags
    const getLangKey = (lang: string, idx: number) => lang && lang.trim() !== '' ? lang : `empty-${idx}`;

    // Use subtype for sizing, default to drawing size
    const subtype = (artwork.subtype || '').toLowerCase();

    // Only render prose cover if medium is writing and artwork has coverImageUrl
    if (artwork.medium === 'writing' && artwork.coverImageUrl) {
      return (
        <CardContainer medium={artwork.medium} $subtype={subtype} onClick={onSelect}>
          <CardInner>
            <CardFront medium={artwork.medium}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardTitle style={{ marginBottom: '0.5rem' }}>{artwork.title}</CardTitle>
                <ProzaImage src={artwork.coverImageUrl} alt={artwork.title} style={{ maxHeight: `calc(100% - 3.5rem)` }} />
                <CardFooter style={{ marginTop: '0.5rem', justifyContent: 'space-between' }}>
                  <span>{formattedDate}</span>
                  <CardCategory>
                    {iconMap[artwork.medium]}
                  </CardCategory>
                </CardFooter>
              </div>
            </CardFront>
            <CardBack>
              <p style={{
                maxHeight: '10em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 8,
                WebkitBoxOrient: 'vertical',
                whiteSpace: 'normal',
              }}>{artwork.description}</p>
            </CardBack>
          </CardInner>
        </CardContainer>
      );
    }

    // Blank card rendering
    const blank = !artwork.title && !artwork.description && !artwork.coverImageUrl;
    if (blank) {
      return null;
    }

    // availableLanguages already declared above

    return (
      <CardContainer medium={artwork.medium} $subtype={subtype} onClick={onSelect}>
        <CardInner>
          <CardFront medium={artwork.medium}>
            <div>
              <CardTitle>{artwork.title}</CardTitle>
              {availableLanguages.length > 1 && (
                <LanguageIndicator>
                  {availableLanguages.filter(lang => lang && lang.trim() !== '').map((lang, idx) => (
                    <LanguageTag key={getLangKey(lang, idx)}>{lang.toUpperCase()}</LanguageTag>
                  ))}
                </LanguageIndicator>
              )}
            </div>
            <CardFooter>
              <span>{formattedDate}</span>
              <CardCategory>
                {getArtworkIcon(artwork)}
              </CardCategory>
            </CardFooter>
          </CardFront>
          <CardBack>
            <p style={{
              maxHeight: '5em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              whiteSpace: 'normal',
            }}>{artwork.description}</p>
          </CardBack>
        </CardInner>
      </CardContainer>
    );
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
