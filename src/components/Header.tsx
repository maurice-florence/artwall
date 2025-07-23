import React from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaArrowRight, FaPenNib, FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaImage, FaVideo, FaEllipsisH, FaCube } from 'react-icons/fa';
import { FaGlobe } from 'react-icons/fa';
import ThemeSwitcher from './ThemeSwitcher'; // Importeren
import { MEDIUMS, MEDIUM_LABELS, SUBTYPE_LABELS } from '@/constants/medium';

const HeaderWrapper = styled.header`
  background: ${({ theme }) => theme.headerBg};
  color: ${({ theme }) => theme.headerText};
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const Title = styled.h1`
  font-family: 'Lora', serif;
  font-size: 2.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.headerText};
  margin: 0;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  font-size: 1.5rem;
  margin-right: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.95;
  transition: color 0.2s, opacity 0.2s;
  &:hover {
    color: ${({ theme }) => theme.headerText};
    opacity: 1;
  }
`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const IconsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CenteredTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  position: relative;
`;

const MEDIUM_ICONS: Record<string, React.ReactNode> = {
  'audio': <FaMusic />,
  'writing': <FaPenNib />,
  'drawing': <FaPaintBrush />,
  'sculpture': <FaCube />,
  'other': <FaGlobe />,
};

const MediumIconButton = styled.button<{ $selected?: boolean }>`
  background: none;
  border: none;
  color: ${({ theme, $selected }) => $selected ? theme.accent : theme.headerText};
  font-size: 1.15rem;
  margin: 0 0.1rem;
  cursor: pointer;
  opacity: ${({ $selected }) => $selected ? 1 : 0.7};
  transition: color 0.2s, opacity 0.2s;
  &:hover {
    color: ${({ theme }) => theme.accent};
    opacity: 1;
  }
`;

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  selectedMedium: string;
  setSelectedMedium: (med: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableMediums: string[];
  availableYears: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}


const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  selectedMedium,
  setSelectedMedium,
  selectedYear,
  setSelectedYear,
  availableMediums,
  availableYears,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <HeaderWrapper data-testid="header">
      <TitleRow data-testid="header-title-row">
        <ToggleButton onClick={onToggleSidebar} title="Toggle Sidebar" data-testid="header-toggle-sidebar">
          {isSidebarOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </ToggleButton>
        <CenteredTitleWrapper>
          <Title data-testid="header-title">Kunstmuur</Title>
        </CenteredTitleWrapper>
      </TitleRow>
      {/* Second row: filters, icons, search, theme */}
      <div style={{ width: '100%' }} data-testid="header-controls-row">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} data-testid="header-filters">
            <IconsWrapper data-testid="header-medium-icons">
              <MediumIconButton
                key="all"
                $selected={selectedMedium === 'all'}
                title="Alle mediums"
                aria-label="Alle mediums"
                onClick={() => setSelectedMedium('all')}
                data-testid="header-medium-all"
              >
                <FaGlobe />
              </MediumIconButton>
              {([...(availableMediums.length > 0 ? availableMediums : MEDIUMS).filter(m => m !== 'other'), 'other']).map((med) => (
                <MediumIconButton
                  key={med}
                  $selected={selectedMedium === med}
                  title={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
                  aria-label={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
                  onClick={() => setSelectedMedium(selectedMedium === med ? 'all' : med)}
                  data-testid={`header-medium-${med}`}
                >
                  {MEDIUM_ICONS[med as keyof typeof MEDIUM_ICONS]}
                </MediumIconButton>
              ))}
            </IconsWrapper>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Zoeken..."
              style={{ padding: '0.4rem 0.8rem', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem', marginLeft: '2rem' }}
              data-testid="header-search"
            />
          </div> {/* <-- Close filters/icons/search row */}
          <RightSection data-testid="header-theme-switcher">
            <ThemeSwitcher />
          </RightSection>
        </div>
      </div> {/* <-- Close the column flex div for title and toolbar */}
    </HeaderWrapper>
  );
};

export default Header;
