import React, { useContext, useState, useRef } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '@/context/ThemeContext';
import type { Theme } from '@/styled';
import { FaSave, FaUndo } from 'react-icons/fa';

const EditorContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ColorCircleLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  border: 1px solid ${({ theme }) => theme.border};
`;

const HiddenColorInput = styled.input.attrs({ type: 'color' })`
  display: none;
`;

const AdvancedToggle = styled.button<{ $active?: boolean }>`
  background: none;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-left: 0.25rem;
  ${({ $active, theme }) => $active ? `box-shadow: 0 4px 10px rgba(0,0,0,0.08); border-color: ${theme.primary};` : ''}
`;

const SaveIconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
`;
const ResetButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
`;

const PalettesContainer = styled.div`
  display: flex;
  gap: 0.35rem;
  align-items: center;
`;

const PaletteSwatch = styled.button<{ $active?: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: ${({ $active, theme }) => $active ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`};
  padding: 0;
  cursor: pointer;
  background-size: cover;
  display: inline-block;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
  &:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
  }
  &:active {
    transform: scale(0.98);
  }
`;

const ThemeEditor: React.FC = () => {
  const { themeObject, updateThemeColor, updateThemeColors, saveThemeAsDefault, resetTheme } = useContext(ThemeContext);
  const [advanced, setAdvanced] = useState(false);

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const complementaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Preset palettes with matching complementary colors to avoid free-form pickers
  const PALETTES: Array<{ name: string; primary: string; complementary: string; secondary?: string; body?: string }> = [
    { name: 'Teal', primary: '#0b8783', complementary: '#f4787c', secondary: '#6b7280', body: '#ffffff' },
    { name: 'Coral', primary: '#E07A5F', complementary: '#5FCFE0', secondary: '#A74B3C', body: '#ffffff' },
    { name: 'Indigo', primary: '#4B2E83', complementary: '#F2A3B1', secondary: '#6b7280', body: '#ffffff' },
    { name: 'Olive', primary: '#607A3B', complementary: '#E8A3B9', secondary: '#8A9775', body: '#ffffff' },
    { name: 'Rose', primary: '#C94C6A', complementary: '#4CD1B6', secondary: '#A64B5A', body: '#ffffff' },
    { name: 'Amber', primary: '#D97706', complementary: '#06C0D9', secondary: '#B26A05', body: '#ffffff' },
    { name: 'Slate', primary: '#374151', complementary: '#F7A8A8', secondary: '#6b7280', body: '#ffffff' },
    { name: 'Purple', primary: '#6B21A8', complementary: '#F0B3E0', secondary: '#6b7280', body: '#ffffff' },
  ];

  const applyPalette = (p: { primary: string; complementary: string; secondary?: string; body?: string }) => {
    // Batch update to avoid multiple intermediate renders
    updateThemeColors({ primary: p.primary, complementary: p.complementary, secondary: p.secondary || themeObject.secondary, body: p.body || themeObject.body });
  };

  return (
    <EditorContainer>
      <PalettesContainer>
        {PALETTES.map(p => (
          <PaletteSwatch
            key={p.name}
            title={p.name}
            $active={themeObject.primary === p.primary}
            onClick={() => applyPalette(p)}
            style={{ background: `linear-gradient(135deg, ${p.primary} 0%, ${p.complementary} 100%)` }}
          />
        ))}
      </PalettesContainer>
      <AdvancedToggle $active={advanced} onClick={() => setAdvanced(a => !a)} title="Show advanced color pickers">
        Advanced
      </AdvancedToggle>
      <ColorCircleLabel style={{ backgroundColor: themeObject.primary }} htmlFor="primary-color">
        1
        {advanced && (
          <HiddenColorInput
            id="primary-color"
            ref={primaryInputRef}
            value={themeObject.primary || '#000000'}
            onChange={(e) => updateThemeColor('primary', e.target.value)}
          />
        )}
      </ColorCircleLabel>

      <ColorCircleLabel style={{ backgroundColor: themeObject.complementary }} htmlFor="complementary-color">
        2
        {advanced && (
          <HiddenColorInput
            id="complementary-color"
            ref={complementaryInputRef}
            value={themeObject.complementary || '#f4787c'}
            onChange={(e) => updateThemeColor('complementary', e.target.value)}
          />
        )}
      </ColorCircleLabel>

      <ColorCircleLabel style={{ backgroundColor: themeObject.secondary }} htmlFor="secondary-color">
        3
        {advanced && (
          <HiddenColorInput
            id="secondary-color"
            ref={secondaryInputRef}
            value={themeObject.secondary || '#ffffff'}
            onChange={(e) => updateThemeColor('secondary', e.target.value)}
          />
        )}
      </ColorCircleLabel>

      <ColorCircleLabel style={{ backgroundColor: themeObject.body }} htmlFor="background-color">
        0
        {advanced && (
          <HiddenColorInput
            id="background-color"
            ref={backgroundInputRef}
            value={themeObject.body || '#ffffff'}
            onChange={(e) => updateThemeColor('body', e.target.value)}
          />
        )}
      </ColorCircleLabel>

      <SaveIconButton onClick={saveThemeAsDefault} title="Save as default">
        <FaSave />
      </SaveIconButton>
      <ResetButton onClick={resetTheme} title="Reset to default">
        <FaUndo />
      </ResetButton>
    </EditorContainer>
  );
};

export default ThemeEditor;