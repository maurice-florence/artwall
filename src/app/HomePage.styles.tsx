import styled from 'styled-components';

const getCardBackground = (theme: any, category?: string) => {
  // Geen speciale stijling meer per categorie
  return theme.cardBackgrounds.default;
};

export const PageLayout = styled.div``;
export const MainContent = styled.main<{ $isSidebarOpen?: boolean }>`
  margin-left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? '350px' : '0')};
`;
export const TimelineContainer = styled.section`
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  &::before, &::after {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    width: 4px;
    height: 32px;
    background: repeating-linear-gradient(
      to bottom,
      ${({ theme }) => theme.accent},
      ${({ theme }) => theme.accent} 8px,
      transparent 8px,
      transparent 16px
    );
    border-radius: 2px;
    z-index: 0;
    transform: translateX(-50%);
  }
  &::before {
    top: 0;
  }
  &::after {
    bottom: 0;
  }
  .vertical-line {
    position: absolute;
    left: 50%;
    top: 32px;
    bottom: 32px;
    width: 4px;
    background: ${({ theme }) => theme.accent};
    border-radius: 2px;
    z-index: 0;
    transform: translateX(-50%);
  }
`;
export const YearHeader = styled.h2<{ $empty?: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0;
  margin-top: 0;
  font-size: ${({ $empty }) => ($empty ? '1rem' : '1.3rem')};
  font-weight: 700;
  color: ${({ theme, $empty }) => $empty ? '#bbb' : theme.accent};
  background: ${({ $empty }) => $empty ? '#f5f5f5' : '#fff'};
  border-radius: 1.5rem;
  padding: 0.2rem 1.2rem;
  z-index: 3;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  top: 0;
`;
export const TimelineYearGroup = styled.div`
  position: relative;
  width: 100%;
  min-height: 180px;
  margin-bottom: 2.5rem;
`;
export const TimelineItemWrapper = styled.div<{ $side?: 'left' | 'right' }>`
  position: relative;
  width: 480px;
  min-width: 320px;
  max-width: 480px;
  min-height: 120px;
  margin-bottom: 2.5rem;
  margin-top: 0;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.cardBackgrounds.default};
  color: ${({ theme }) => theme.cardText};
  font-family: 'Nunito Sans', sans-serif;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 1.5rem 2rem;
  transition: background 0.3s, color 0.3s, font-family 0.3s;
  cursor: pointer;
  z-index: 2;
  left: ${({ $side }) => $side === 'right' ? 'calc(50% + 40px)' : 'auto'};
  right: ${({ $side }) => $side === 'left' ? 'calc(50% + 40px)' : 'auto'};
  margin-left: ${({ $side }) => $side === 'right' ? '40px' : '0'};
  margin-right: ${({ $side }) => $side === 'left' ? '40px' : '0'};
  justify-content: ${({ $side }) => $side === 'right' ? 'flex-start' : 'flex-end'};
  &::before {
    content: '';
    position: absolute;
    top: 2rem;
    ${({ $side }) => $side === 'right' ? 'left: -18px;' : 'right: -18px;'}
    border-width: 12px 12px 12px 0;
    border-style: solid;
    border-color: transparent ${({ theme, $side }) => $side === 'right' ? theme.cardBackgrounds.default : 'transparent'} transparent ${({ theme, $side }) => $side === 'left' ? theme.cardBackgrounds.default : 'transparent'};
    background: none;
    width: 0;
    height: 0;
    z-index: 3;
    transform: ${({ $side }) => $side === 'right' ? 'rotate(0deg)' : 'rotateY(180deg)'};
    @media (max-width: 900px) {
      display: none;
    }
  }
  @media (max-width: 900px) {
    width: 90vw;
    min-width: 0;
    max-width: 98vw;
    left: 0;
    right: 0;
    margin-left: 0;
    margin-right: 0;
    justify-content: flex-start;
  }
`;

export const ItemHeader = styled.header<{ $details?: string }>`
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ActionsContainer = styled.div<{ itemCategory?: string }>`
  display: flex;
  gap: 8px;
  & > span > svg {
    cursor: pointer;
    color: ${({ theme, itemCategory }) =>
      itemCategory === 'muziek' ? theme.headerText : theme.text};
    transition: color 0.2s;
    &:hover {
      color: ${({ theme }) => theme.accent};
    }
  }
`;

export const ItemCategory = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: ${({ theme }) => theme.accent};
  font-family: 'Nunito Sans', sans-serif;
  font-size: 1.1em;
  svg {
    color: ${({ theme }) => theme.accent};
    font-size: 1.2em;
  }
`;

export const NoResultsMessage = styled.div`
  color: #888;
  text-align: center;
  margin-top: 2rem;
`;
