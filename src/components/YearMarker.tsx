import React from 'react';
import styled from 'styled-components';

const YearCardContainer = styled.div`
    width: 100%;
    max-width: 150px;
    aspect-ratio: 3/4;
    display: flex;
    justify-content: center;
    align-items: center;
    background: transparent;
    color: ${({ theme }) => theme.primary};
    border-radius: 12px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 2.5rem;
    font-weight: bold;
    grid-column: span 1;
    grid-row: span 1;
    border: none;
    pointer-events: none;
    user-select: none;

    @media (max-width: 768px) {
      grid-column: span 1;
      max-width: none;
      aspect-ratio: 3 / 4;
      font-size: 2rem;
    }
`;

interface YearMarkerProps {
    year: number;
}

const YearMarkerCard = ({ year }: YearMarkerProps) => {
    return <YearCardContainer>{year}</YearCardContainer>;
};

export default YearMarkerCard;
