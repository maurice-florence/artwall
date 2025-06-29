import React from 'react';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa';
import ThemeSwitcher from './ThemeSwitcher'; // Importeren

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

const Title = styled.h1`/* ... */`;
const ToggleButton = styled.button`/* ... */`;

const RightSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1.5rem;
`;

const Header = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
  return (
    <HeaderWrapper>
      <ToggleButton onClick={onToggleSidebar} title="Toggle Sidebar">
          <FaBars />
      </ToggleButton>
      <Title>Mijn Creatieve Tijdlijn</Title>
      <RightSection>
        <ThemeSwitcher />
      </RightSection>
    </HeaderWrapper>
  );
};

export default Header;
