import styled, { keyframes } from 'styled-components';

// --- Styled Components voor de Layout ---

export const PageLayout = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.body};
  overflow-x: hidden;
`;

export const MainContent = styled.div`
  flex-grow: 1;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 12px;
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
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
  gap: 4px;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  /* For a 3:4 aspect ratio, set grid-auto-rows to 1fr and control height in the card */
  /* For a 3:4 aspect ratio, match the min column width (120px) */
  grid-auto-rows: 1fr;
  grid-auto-flow: dense;
`;

export const YearSeparatorCard = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #888;
  font-size: 1.3em;
  font-weight: bold;
  border-radius: 10px;
  border: none;
  box-shadow: none;
  pointer-events: none;
  user-select: none;
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