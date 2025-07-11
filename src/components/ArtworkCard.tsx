import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Artwork, ArtworkCategory, PoetryArtwork, ProseArtwork, VisualArtArtwork, MusicArtwork, VideoArtwork, OtherArtwork } from '@/types';
import { FaPenNib, FaPaintBrush, FaMusic, FaBookOpen, FaVolumeUp, FaAlignLeft } from 'react-icons/fa';

interface CardContainerProps {
    category: ArtworkCategory;
}

const getGridSpan = (category: ArtworkCategory, rowSpan: number = 1) => {
    switch(category) {
        case 'prose':
            return `grid-column: span 2; grid-row: span ${rowSpan};`;
        case 'prosepoetry':
            return `grid-column: span 1.5; grid-row: span ${rowSpan};`;
        case 'music':
            return 'grid-column: span 2; grid-row: span 1;';
        case 'sculpture':
            return 'grid-row: span 1;';
        case 'drawing':
        case 'poetry':
        default:
            return 'grid-column: span 1; grid-row: span 1;';
    }
};

const CardContainer = styled.div<CardContainerProps & { $rowSpan?: number; $blank?: boolean }>`
  perspective: 1000px;
  width: 100%;
  border-radius: 12px;
  /* Remove explicit height, let grid control it */
  ${props => getGridSpan(props.category, props.$rowSpan)}

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
const CardFront = styled(CardFace)<{ category: ArtworkCategory }>`
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

const iconMap: { [key: string]: React.JSX.Element } = {
  poetry: <FaPenNib />,
  prosepoetry: <FaAlignLeft />,
  prose: <FaBookOpen />,
  sculpture: <FaPaintBrush />,
  drawing: <FaPaintBrush />,
  music: <FaMusic />,
};

// Add a helper to get the correct icon for audio
const getArtworkIcon = (artwork: Artwork) => {
  if ('mediaType' in artwork && artwork.mediaType === 'audio') return <FaMusic />;
  return iconMap[artwork.category] || null;
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

    // Make all cards 1/3 smaller in height
    const reducedCardHeight = Math.round((theme.cardHeight || 280) * (2/3));
    const gridGap = theme.gridGap || 24;

    const formattedDate = new Date(artwork.year, (artwork.month || 1) - 1, artwork.day || 1)
                            .toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });

    const hasCover = artwork.category === 'prose' && 'coverImageUrl' in artwork;
    // Calculate rowSpan for prose: 2 rows + 1 gap, so rowSpan = 2 + (gridGap / reducedCardHeight)
    let rowSpan = 1;
    if (artwork.category === 'prose') {
      rowSpan = Math.round((reducedCardHeight * 2 + gridGap) / reducedCardHeight);
    }
    // Only render prose cover if category is prose and artwork has coverImageUrl
    if ((artwork as any).category === 'prose' && (artwork as any).coverImageUrl) {
      return (
        <CardContainer category={artwork.category} $rowSpan={rowSpan} onClick={onSelect}>
          <CardInner>
            <CardFront category={artwork.category}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardTitle style={{ marginBottom: '0.5rem' }}>{artwork.title}</CardTitle>
                <ProzaImage src={(artwork as any).coverImageUrl} alt={artwork.title} style={{ maxHeight: `calc(100% - 3.5rem)` }} />
                <CardFooter style={{ marginTop: '0.5rem', justifyContent: 'space-between' }}>
                  <span>{formattedDate}</span>
                  <CardCategory>
                    {iconMap[artwork.category]}
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
    const blank = !artwork.title && !artwork.description && !('coverImageUrl' in artwork && artwork.coverImageUrl);
    if (blank) {
      return null;
    }

    // Get available languages
    const availableLanguages = [];
    if (artwork.language1) availableLanguages.push(artwork.language1);
    if (artwork.language2) availableLanguages.push(artwork.language2);
    if (artwork.language3) availableLanguages.push(artwork.language3);

    return (
      <CardContainer category={artwork.category} $rowSpan={rowSpan} onClick={onSelect}>
        <CardInner>
          <CardFront category={artwork.category}>
            <div>
              <CardTitle>{artwork.title}</CardTitle>
              {availableLanguages.length > 1 && (
                <LanguageIndicator>
                  {availableLanguages.map(lang => (
                    <LanguageTag key={lang}>{lang.toUpperCase()}</LanguageTag>
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
