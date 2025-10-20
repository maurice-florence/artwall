import React from 'react';
import styled from 'styled-components';

const YearCardContainer = styled.div`
    width: 66%; /* 2/3 of the parent width */
    max-width: 66%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.primary};
    border-radius: 12px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0 auto;
    /* Zorg dat de jaartal-kaart smal is */
    grid-column: span 1;
    grid-row: span 1;
    border: none;

    @media (max-width: 768px) {
      grid-column: span 2; /* Neem volle breedte op mobiel */
      width: 90%;
      max-width: 90%;
      height: 100px; /* Maak het een smalle balk op mobiel */
      grid-row: span 1;
    }
`;

interface YearMarkerProps {
    year: number;
}

const YearMarkerCard = ({ year }: YearMarkerProps) => {
    return <YearCardContainer>{year}</YearCardContainer>;
};

export default YearMarkerCard;
