import styled, { keyframes } from 'styled-components';

// --- Styled Components voor de Layout ---

export const PageLayout = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.body};
`;

export const MainContent = styled.div`
  flex-grow: 1;
    width: 100%;
    padding: 0 180px;
  transition: none;
  @media (max-width: 1024px) {
    padding: 0 24px;
  }
  @media (max-width: 768px) {
    padding: 0 12px;
  }
`;

export const CollageContainer = styled.main`
  display: grid;
  padding: 1.5rem;
  gap: ${({ theme }) => theme.gridGap ? `${theme.gridGap}px` : '4px'};
  
  /* De kern van de nieuwe layout */
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-auto-rows: 225px;
  
  /* Deze regel vertelt de grid om gaten op te vullen! */
  grid-auto-flow: dense;

  @media (min-width: 1920px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 210px;
    padding: 1rem;
  }
  @media (max-width: 768px) {
    /* Ensure at least three cards per row on portrait mobile */
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 180px;
    padding: 0.75rem;
  }
  @media (max-width: 480px) {
    /* Keep three columns even on very small devices as requested */
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 160px;
    padding: 0.5rem;
  }
`;

// --- Hulp-componenten ---

const pulse = keyframes`
  0% { background-color: #e0e0e0; }
  50% { background-color: #f0f0f0; }
  100% { background-color: #e0e0e0; }
`;

export const SkeletonCard = styled.div`
  height: 225px;
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