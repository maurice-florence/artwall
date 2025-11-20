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
  width: 100vw;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  gap: ${({ theme }) => theme.gridGap ? `${theme.gridGap}px` : '4px'};
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  grid-auto-rows: minmax(140px, 1fr);
  grid-auto-flow: dense;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(120px, 1fr);
    gap: 8px;
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(100px, 1fr);
    gap: 6px;
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(80px, 1fr);
    gap: 4px;
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