import React from 'react';
import styled, { useTheme } from 'styled-components';
import { Artwork, ArtworkCategory } from '@/types';
import { FaPenNib, FaPaintBrush, FaMusic, FaBookOpen, FaVolumeUp, FaAlignLeft } from 'react-icons/fa';

interface CardContainerProps {
    category: ArtworkCategory;
}

const getGridSpan = (category: ArtworkCategory, rowSpan: number = 1) => {
    switch(category) {
        case 'proza':
            return `grid-column: span 2; grid-row: span ${rowSpan};`;
        case 'prozapoëzie':
            return `grid-column: span 1.5; grid-row: span ${rowSpan};`;
        case 'muziek':
            return 'grid-column: span 2; grid-row: span 1;';
        case 'sculptuur':
            return 'grid-row: span 2;';
        case 'tekening':
        case 'poëzie':
        default:
            return 'grid-column: span 1; grid-row: span 1;';
    }
};

const CardContainer = styled.div<CardContainerProps & { $rowSpan?: number; $blank?: boolean }>`
  perspective: 1000px;
  width: 100%;
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
  poëzie: <FaPenNib />,
  prozapoëzie: <FaAlignLeft />,
  proza: <FaBookOpen />,
  sculptuur: <FaPaintBrush />,
  tekening: <FaPaintBrush />,
  muziek: <FaMusic />,
};

// Add a helper to get the correct icon for audio
const getArtworkIcon = (artwork: Artwork) => {
  if (artwork.mediaType === 'audio') return <FaMusic />;
  return iconMap[artwork.category] || null;
};

interface ArtworkCardProps {
    artwork: Artwork;
    onSelect: () => void;
    isAdmin?: boolean;
}

const ArtworkCard = ({ artwork, onSelect, isAdmin }: ArtworkCardProps) => {
    const theme = useTheme();

    // Make all cards 1/3 smaller in height
    const reducedCardHeight = Math.round((theme.cardHeight || 280) * (2/3));
    const gridGap = theme.gridGap || 24;

    const formattedDate = new Date(artwork.year, (artwork.month || 1) - 1, artwork.day || 1)
                            .toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });

    const hasCover = artwork.category === 'proza' && artwork.coverImageUrl;
    // Calculate rowSpan for proza: 2 rows + 1 gap, so rowSpan = 2 + (gridGap / reducedCardHeight)
    let rowSpan = 1;
    if (artwork.category === 'proza') {
      rowSpan = Math.round((reducedCardHeight * 2 + gridGap) / reducedCardHeight);
    }

    if (hasCover) {
      // Proza with cover: header and footer outside image, image fills available space
      return (
        <CardContainer category={artwork.category} $rowSpan={rowSpan} onClick={onSelect}>
          <CardInner>
            <CardFront category={artwork.category}>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardTitle style={{ marginBottom: '0.5rem' }}>{artwork.title}</CardTitle>
                <ProzaImage src={artwork.coverImageUrl} alt={artwork.title} style={{ maxHeight: `calc(100% - 3.5rem)` }} />
                <CardFooter style={{ marginTop: '0.5rem', justifyContent: 'space-between' }}>
                  <span>{formattedDate}</span>
                  <CardCategory>
                    {iconMap[artwork.category]}
                  </CardCategory>
                </CardFooter>
              </div>
            </CardFront>
            <CardBack>
              <p>{artwork.description}</p>
            </CardBack>
          </CardInner>
        </CardContainer>
      );
    }

    // Blank card rendering
    const blank = !artwork.title && !artwork.description && !artwork.coverImageUrl;
    if (blank) {
      return (
        <CardContainer category="poëzie" $blank>
          <CardInner>
            <CardFront category="poëzie">
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <span style={{ fontSize: '2.5rem', color: '#ccc' }}>+</span>
              </div>
              <CardFooter style={{ visibility: 'hidden' }}>
                {/* Empty footer for consistent height */}
              </CardFooter>
            </CardFront>
          </CardInner>
        </CardContainer>
      );
    }

    return (
      <CardContainer category={artwork.category} $rowSpan={rowSpan} onClick={onSelect}>
        <CardInner>
          <CardFront category={artwork.category}>
            <CardTitle>{artwork.title}</CardTitle>
            {artwork.category === 'proza' && artwork.coverImageUrl && (
              <ProzaImage src={artwork.coverImageUrl} alt={artwork.title} style={{ maxHeight: `calc(100% - 3.5rem)` }} />
            )}
            <CardFooter style={{ justifyContent: 'space-between' }}>
              <span>{formattedDate}</span>
              <CardCategory>
                 {getArtworkIcon(artwork)}
              </CardCategory>
            </CardFooter>
          </CardFront>
          <CardBack>
            <p>{artwork.description}</p>
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

export default ArtworkCard;
