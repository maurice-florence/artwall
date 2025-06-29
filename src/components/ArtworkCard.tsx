import React from 'react';
import styled from 'styled-components';
import { Artwork } from '@/types';
import { FaPenNib, FaPaintBrush, FaMusic, FaBookOpen } from 'react-icons/fa';

// Voeg de juiste prop types toe aan CardContainer zodat 'category' werkt
const CardContainer = styled.div<{ category: string }>`
  perspective: 1000px; /* Nodig voor het 3D effect */
  width: 100%;
  height: 100%;
  
  /* Dynamische breedte op basis van categorie */
  grid-column: span ${props => (props.category === 'proza' ? 2 : 1)};
  grid-row: span ${props => (props.category === 'proza' ? 2 : 1)};

  @media (max-width: 768px) {
      grid-column: span 2; /* Op mobiel nemen alle kaarten de volle breedte */
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
  backface-visibility: hidden;
  border-radius: 12px; /* Pas hier de ronding van de hoeken aan */
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.cardText};
`;

const CardFront = styled(CardFace)`
  background: ${({ theme }) => theme.cardBg};
  padding: 1rem;
  justify-content: space-between;
`;

const CardBack = styled(CardFace)`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accentText};
  transform: rotateY(180deg);
  padding: 1.5rem;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const CardTitle = styled.h3`
  font-family: 'Lora', serif;
  font-size: 1.2rem;
  margin: 0;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  opacity: 0.8;
`;

const CardCategory = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const iconMap: Record<import("@/types").ArtworkCategory, React.ReactNode> = {
  poëzie: <FaPenNib />,
  proza: <FaBookOpen />,
  sculptuur: <FaPaintBrush />,
  tekening: <FaPaintBrush />,
  muziek: <FaMusic />,
};

interface ArtworkCardProps {
    artwork: Artwork;
    onSelect: () => void;
}

const ArtworkCard = ({ artwork, onSelect }: ArtworkCardProps) => {
    const formattedDate = new Date(artwork.year, (artwork.month || 1) - 1, artwork.day || 1)
                            .toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });

    return (
        <CardContainer category={artwork.category} onClick={onSelect}>
            <CardInner>
                <CardFront>
                    <CardTitle>{artwork.title}</CardTitle>
                    <CardFooter>
                        <span>{formattedDate}</span>
                        <CardCategory>
                           {iconMap[artwork.category]}
                           <span>{artwork.category}</span>
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

export default ArtworkCard;

