import React from 'react';
import styled from 'styled-components';
import { FaGripLines, FaPenNib, FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaImage, FaVideo, FaEllipsisH, FaCube } from 'react-icons/fa';
import ThemeSwitcher from './ThemeSwitcher'; // Importeren
import { MEDIUMS, MEDIUM_LABELS, SUBTYPE_LABELS } from '@/constants/medium';

const HeaderWrapper = styled.header`
  background: ${({ theme }) => theme.headerBg};
  color: ${({ theme }) => theme.headerText};
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
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
  color: ${({ theme }) => theme.headerText};
  font-size: 1.15rem;
  margin: 0 0.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.85;
  transition: color 0.2s, opacity 0.2s;
  &:hover {
    color: ${({ theme }) => theme.accent};
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
  'other': <FaEllipsisH />,
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

const Header = ({ onToggleSidebar, selectedMediums = [], onMediumToggle, availableMediums = [] }: { onToggleSidebar: () => void, selectedMediums?: string[], onMediumToggle?: (med: string) => void, availableMediums?: string[] }) => {
  return (
    <HeaderWrapper>
      <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
        <ToggleButton onClick={onToggleSidebar} title="Toggle Sidebar">
          <FaGripLines />
        </ToggleButton>
        <IconsWrapper style={{ marginLeft: '2rem', marginRight: 0 }}>
          {(availableMediums.length > 0 ? availableMediums : MEDIUMS).map((med) => (
            <MediumIconButton
              key={med}
              $selected={selectedMediums.includes(med as string)}
              title={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
              aria-label={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
              onClick={() => onMediumToggle && onMediumToggle(med as string)}
            >
              {MEDIUM_ICONS[med as keyof typeof MEDIUM_ICONS]}
            </MediumIconButton>
          ))}
        </IconsWrapper>
      </div>
      <CenteredTitleWrapper>
        <Title>Kunstmuur</Title>
      </CenteredTitleWrapper>
      <RightSection>
        <ThemeSwitcher />
      </RightSection>
    </HeaderWrapper>
  );
};

export default Header;
