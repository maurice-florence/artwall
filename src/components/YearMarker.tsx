import React from 'react';
import styled from 'styled-components';

const YearMarkerContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0 1rem 0;
`;

const YearText = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  background: ${({ theme }) => theme.cardBg};
  border-radius: 8px;
  padding: 0.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
`;

interface YearMarkerCardProps {
  year: number;
}

const YearMarkerCard: React.FC<YearMarkerCardProps> = ({ year }) => (
  <YearMarkerContainer>
    <YearText>{year}</YearText>
  </YearMarkerContainer>
);

export default YearMarkerCard;
