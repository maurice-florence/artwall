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
  grid-auto-rows: 1fr;
  grid-auto-flow: dense;

  @media (min-width: 1920px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (max-width: 1024px) {
    /* Desktop-to-tablet: tighten slightly but keep card size */
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-auto-rows: 210px;
    padding: 1rem;
  }
  @media (max-width: 768px) {
    /* Mobile portrait/landscape: enforce fixed card width to prevent stretch + overlap */
    grid-template-columns: repeat(auto-fill, 120px);
    grid-auto-rows: 150px; /* matches 120px * 1.25 (aspect-ratio 4/5) */
    justify-content: center; /* center leftover space */
    padding: 0.5rem;
    gap: 2px;
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, 120px);
    grid-auto-rows: 150px;
    justify-content: center;
    padding: 0.4rem;
    gap: 2px;
  }
`;

<<<<<<< HEAD
  @media (min-width: 1920px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (max-width: 1024px) {
    /* Desktop-to-tablet: tighten slightly but keep card size */
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-auto-rows: 210px;
    padding: 1rem;
  }
  @media (max-width: 768px) {
    /* Mobile portrait/landscape: enforce fixed card width to prevent stretch + overlap */
    grid-template-columns: repeat(auto-fill, 120px);
    grid-auto-rows: 150px; /* matches 120px * 1.25 (aspect-ratio 4/5) */
    justify-content: center; /* center leftover space */
    padding: 0.5rem;
    gap: 2px;
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, 120px);
    grid-auto-rows: 150px;
    justify-content: center;
    padding: 0.4rem;
    gap: 2px;
  }
=======
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
>>>>>>> fix/grid-reorder-by-size
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