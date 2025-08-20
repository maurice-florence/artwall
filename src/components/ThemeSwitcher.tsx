// src/components/ThemeSwitcher.tsx
import React, { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import styled from 'styled-components';

const SwitcherContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ThemeButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.headerText};
  cursor: pointer;
  background-color: ${(props) => props.color};
`;

const ThemeSwitcher: React.FC = () => {
  const { toggleTheme } = useContext(ThemeContext);

  return (
    <SwitcherContainer>
      <ThemeButton
        color="#2E86C1"
        onClick={() => toggleTheme('blueprint')}
        title="Blueprint Thema"
      />
      <ThemeButton color="#1E2732" onClick={() => toggleTheme('dark')} title="Dark Mode" />
      <ThemeButton color="#00796B" onClick={() => toggleTheme('teal')} title="Teal Theme" />
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;
