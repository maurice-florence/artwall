import styled, { keyframes, css } from 'styled-components';

const pulse = keyframes`
  0% { background-color: #e0e0e0; }
  50% { background-color: #f0f0f0; }
  100% { background-color: #e0e0e0; }
`;

export const SkeletonCard = styled.div`
  height: 150px;
  width: 100%;
  border-radius: 8px;
  margin-bottom: 2rem;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const PageLayout = styled.div`
  display: flex;
`;

export const MainContent = styled.div<{ $isSidebarOpen: boolean }>`
  flex-grow: 1;
  transition: margin-left 0.3s ease-in-out;
  margin-left: ${props => props.$isSidebarOpen ? '350px' : '0'};

  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

export const CollageContainer = styled.main`
  display: grid;
  padding: 2rem;
  gap: 1rem;
  /* De Magie: maak kolommen van minimaal 200px breed, 
     en laat ze de beschikbare ruimte opvullen */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  
  /* Zorg dat alle rijen dezelfde hoogte hebben */
  grid-auto-rows: 250px; 
`;

export const NoResultsMessage = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: ${({ theme }) => theme.text}99; /* Iets transparanter */
    font-style: italic;
    width: 100%;
`;
