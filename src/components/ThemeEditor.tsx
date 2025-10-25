import React, { useContext, useState, useRef } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '@/context/ThemeContext';
import type { Theme } from '@/styled';
import { BaseIconButton, Dropdown as ColorDropdown } from './common';
import { useDropdown } from '@/hooks/useDropdown';
import { FaSave, FaUndo, FaCog, FaPalette } from 'react-icons/fa';

const EditorContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: relative; /* for dropdowns */
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
  border: 1px solid ${({ theme }: { theme: Theme }) => theme.border};
`;

const HiddenColorInput = styled.input.attrs({ type: 'color' })`
  display: none;
`;

const AdvancedToggle = styled(BaseIconButton)`
  margin-left: 0.25rem;
`;

const SaveIconButton = styled(BaseIconButton)``;

const ResetButton = styled(BaseIconButton)``;

const PaletteSwatch = styled.button<{ $active?: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: ${({ $active, theme }: { $active?: boolean, theme: Theme }) => $active ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`};
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
  const editorRef = useRef<HTMLDivElement | null>(null);
  const { isMounted: dropdownMounted, isClosing: dropdownClosing, toggle: toggleDropdown, close: closeDropdown } = useDropdown(editorRef);

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
    closeDropdown();
  };

  return (
    <EditorContainer ref={editorRef}>
      <SaveIconButton onClick={saveThemeAsDefault} title="Save as default">
        <FaSave />
      </SaveIconButton>
      <ResetButton onClick={resetTheme} title="Reset to default">
        <FaUndo />
      </ResetButton>

      {dropdownMounted && (
        <ColorDropdown $closing={dropdownClosing} style={{ minWidth: 200, top: 'calc(100% + 6px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', padding: '0 0.2rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: themeObject.secondary }}>Theme Colors</span>
            <AdvancedToggle
              $active={advanced}
              onClick={() => setAdvanced((a: boolean) => !a)}
              title="Advanced options"
              aria-label="Advanced options"
              aria-pressed={advanced}
            ><FaCog /></AdvancedToggle>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(30px, 1fr))', gap: '0.35rem' }}>
            {PALETTES.map(p => (
              <PaletteSwatch
                key={p.name}
                title={p.name}
                $active={themeObject.primary.toLowerCase() === p.primary.toLowerCase()}
                onClick={() => { applyPalette(p); }}
                style={{ background: `linear-gradient(135deg, ${p.primary} 0%, ${p.complementary} 100%)` }}
              />
            ))}
          </div>

          {/* Advanced color pickers below presets */}
          {advanced && (
            <div style={{ borderTop: `1px solid ${themeObject.border}`, marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ColorCircleLabel style={{ backgroundColor: themeObject.primary }} htmlFor="primary-color">
                  <HiddenColorInput
                    id="primary-color"
                    value={themeObject.primary || '#000000'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('primary', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Primary</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ColorCircleLabel style={{ backgroundColor: themeObject.complementary }} htmlFor="complementary-color">
                  <HiddenColorInput
                    id="complementary-color"
                    value={themeObject.complementary || '#f4787c'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('complementary', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Complementary</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ColorCircleLabel style={{ backgroundColor: themeObject.secondary }} htmlFor="secondary-color">
                  <HiddenColorInput
                    id="secondary-color"
                    value={themeObject.secondary || '#ffffff'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('secondary', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Secondary</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ColorCircleLabel style={{ backgroundColor: themeObject.body }} htmlFor="background-color">
                  <HiddenColorInput
                    id="background-color"
                    value={themeObject.body || '#ffffff'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('body', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Background</span>
              </div>
            </div>
          )}
        </ColorDropdown>
      )}

      <BaseIconButton
        aria-label="Choose palette"
        title="Choose theme colors"
        onClick={toggleDropdown}
        $active={dropdownMounted}
      ><FaPalette /></BaseIconButton>
    </EditorContainer>
  );
};

export default ThemeEditor;