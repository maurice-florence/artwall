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

  // Preset palettes using triadic color schemes (120° apart) and analogous variations
  const PALETTES: Array<{ name: string; primary: string; secondary: string; tertiary: string; inactive: string; body?: string }> = [
    { name: 'Teal', primary: '#0b8783', secondary: '#E85D4F', tertiary: '#F4A742', inactive: '#94A3A8', body: '#ffffff' },
    { name: 'Blue', primary: '#2563EB', secondary: '#DC2626', tertiary: '#F59E0B', inactive: '#9CA3AF', body: '#ffffff' },
    { name: 'Purple', primary: '#7C3AED', secondary: '#059669', tertiary: '#EA580C', inactive: '#A78BFA', body: '#ffffff' },
    { name: 'Indigo', primary: '#4F46E5', secondary: '#EAB308', tertiary: '#EC4899', inactive: '#818CF8', body: '#ffffff' },
    { name: 'Green', primary: '#059669', secondary: '#7C3AED', tertiary: '#DC2626', inactive: '#6EE7B7', body: '#ffffff' },
    { name: 'Rose', primary: '#E11D48', secondary: '#3B82F6', tertiary: '#10B981', inactive: '#FDA4AF', body: '#ffffff' },
    { name: 'Amber', primary: '#D97706', secondary: '#8B5CF6', tertiary: '#06B6D4', inactive: '#FCD34D', body: '#ffffff' },
    { name: 'Cyan', primary: '#0891B2', secondary: '#F97316', tertiary: '#A855F7', inactive: '#67E8F9', body: '#ffffff' },
  ];

  const applyPalette = (p: { primary: string; secondary: string; tertiary: string; inactive: string; body?: string }) => {
    // Batch update to avoid multiple intermediate renders
    updateThemeColors({ 
      primary: p.primary, 
      secondary: p.secondary,
      tertiary: p.tertiary,
      inactive: p.inactive,
      body: p.body || themeObject.body 
    });
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
                style={{ background: `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 50%, ${p.tertiary} 100%)` }}
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
                <ColorCircleLabel style={{ backgroundColor: themeObject.secondary }} htmlFor="secondary-color">
                  <HiddenColorInput
                    id="secondary-color"
                    value={themeObject.secondary || '#E85D4F'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('secondary', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Secondary</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ColorCircleLabel style={{ backgroundColor: themeObject.tertiary }} htmlFor="tertiary-color">
                  <HiddenColorInput
                    id="tertiary-color"
                    value={themeObject.tertiary || '#F4A742'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('tertiary', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Tertiary</span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ColorCircleLabel style={{ backgroundColor: themeObject.inactive }} htmlFor="inactive-color">
                  <HiddenColorInput
                    id="inactive-color"
                    value={themeObject.inactive || '#94A3A8'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateThemeColor('inactive', e.target.value)}
                  />
                </ColorCircleLabel>
                <span style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }}>Inactive</span>
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