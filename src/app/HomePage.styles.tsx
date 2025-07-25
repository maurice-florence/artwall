import styled, { keyframes } from 'styled-components';

// --- Styled Components voor de Layout ---

export const PageLayout = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.body};
`;

export const MainContent = styled.div`
  flex-grow: 1;
  width: 100%;
  transition: none;
`;

export const CollageContainer = styled.main`
  display: grid;
  padding: 1.5rem;
  gap: ${({ theme }) => theme.gridGap ? `${theme.gridGap}px` : '24px'};
  
  /* De kern van de nieuwe layout */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: ${({ theme }) => theme.cardHeight ? `${theme.cardHeight}px` : '280px'};
  
  /* Deze regel vertelt de grid om gaten op te vullen! */
  grid-auto-flow: dense;
`;

// --- Hulp-componenten ---

const pulse = keyframes`
  0% { background-color: #e0e0e0; }
  50% { background-color: #f0f0f0; }
  100% { background-color: #e0e0e0; }
`;

export const SkeletonCard = styled.div`
  height: ${({ theme }) => theme.cardHeight ? `${theme.cardHeight}px` : '280px'};
  width: 100%;
  border-radius: 12px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const NoResultsMessage = styled.div`
    grid-column: 1 / -1; 
    text-align: center;
    padding: 4rem 2rem;
    color: ${({ theme }) => theme.text}99; 
    font-style: italic;
`;
