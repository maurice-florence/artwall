import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '@/context/ThemeContext';
import type { Theme } from '@/styled';
import { FaSave, FaUndo, FaCog } from 'react-icons/fa';

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
  /* match SaveIconButton style for consistency with other icon buttons */
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  height: calc(1rem + 0.8rem);
  margin-left: 0.25rem;
  ${({ $active, theme }) => $active ? `filter: drop-shadow(0 4px 8px rgba(0,0,0,0.06));` : ''}
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
  height: calc(1rem + 0.8rem);
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
  height: calc(1rem + 0.8rem);
`;

const PalettesContainer = styled.div`
  position: relative;
  display: inline-block;
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

const GradientButton = styled.button`
  /* Match search input height: search uses font-size 1rem with 0.4rem vertical padding (0.8rem total)
     so height = 1rem + 0.8rem = 1.8rem. Use same for width to keep a circle. */
  width: calc(1rem + 0.8rem);
  height: calc(1rem + 0.8rem);
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 0;
  cursor: pointer;
  display: inline-block;
  background-size: cover;
  transition: transform 140ms ease, box-shadow 140ms ease;
  &:hover { transform: scale(1.04); box-shadow: 0 6px 12px rgba(0,0,0,0.06); }
`;

const DropdownContainer = styled.div<{ $closing?: boolean }>`
  position: absolute;
  top: 44px;
  left: 0;
  background: ${({ theme }) => theme.body};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.4rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, 34px);
  gap: 0.35rem;
  z-index: 40;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
  animation: ${({ $closing }) => $closing ? 'fadeOutDown 140ms ease forwards' : 'fadeInUp 160ms ease forwards'};

  @keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes fadeOutDown {
    to { opacity: 0; transform: translateY(-6px) scale(0.99); }
  }
`;

const ThemeEditor: React.FC = () => {
  const { themeObject, updateThemeColor, updateThemeColors, saveThemeAsDefault, resetTheme } = useContext(ThemeContext);
  const [advanced, setAdvanced] = useState(false);
  const [showPalettes, setShowPalettes] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  const [dropdownClosing, setDropdownClosing] = useState(false);
  const palettesRef = useRef<HTMLDivElement | null>(null);

  // open/close helpers that perform animated close on unmount
  const closeDropdown = useCallback(() => {
    if (!dropdownMounted) return;
    setDropdownClosing(true);
    setShowPalettes(false);
    // wait for animation to finish then unmount
    window.setTimeout(() => {
      setDropdownMounted(false);
      setDropdownClosing(false);
    }, 180);
  }, [dropdownMounted]);

  const toggleDropdown = useCallback(() => {
    if (!dropdownMounted) {
      setDropdownMounted(true);
      setDropdownClosing(false);
      setShowPalettes(true);
      return;
    }
    // if mounted and open -> close
    if (showPalettes) {
      closeDropdown();
    } else {
      // reopen quickly
      setDropdownClosing(false);
      setShowPalettes(true);
    }
  }, [dropdownMounted, showPalettes, closeDropdown]);

  // Close dropdown when clicking outside or pressing Escape
  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (!dropdownMounted) return;
    const target = e.target as Node;
    if (palettesRef.current && !palettesRef.current.contains(target)) {
      // trigger animated close
      closeDropdown();
    }
  }, [dropdownMounted, closeDropdown]);

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeDropdown();
      setAdvanced(false);
    }
  }, [closeDropdown]);

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleDocumentClick, handleKeydown]);

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
    setShowPalettes(false);
  };

  return (
    <EditorContainer>
      <PalettesContainer ref={palettesRef}>
        <GradientButton
          aria-label="Choose palette"
          title="Choose palette"
          onClick={toggleDropdown}
          style={{ background: `linear-gradient(135deg, ${themeObject.primary || '#0b8783'} 0%, ${(themeObject as any).complementary || '#f4787c'} 100%)` }}
        />

        {dropdownMounted && (
          <DropdownContainer $closing={dropdownClosing}>
            {PALETTES.map(p => (
              <PaletteSwatch
                key={p.name}
                title={p.name}
                $active={themeObject.primary === p.primary}
                onClick={() => { applyPalette(p); closeDropdown(); }}
                style={{ background: `linear-gradient(135deg, ${p.primary} 0%, ${p.complementary} 100%)` }}
              />
            ))}
          </DropdownContainer>
        )}
      </PalettesContainer>

      <AdvancedToggle
        $active={advanced}
        onClick={() => setAdvanced(a => !a)}
        title="Advanced options"
        aria-label="Advanced options"
        aria-pressed={advanced}
      >
        <FaCog />
      </AdvancedToggle>

      {/* Individual color pickers are hidden by default. They appear only when Advanced (gear) is active. */}
      {advanced && (
        <>
          <ColorCircleLabel style={{ backgroundColor: themeObject.primary }} htmlFor="primary-color">
            <HiddenColorInput
              id="primary-color"
              ref={primaryInputRef}
              value={themeObject.primary || '#000000'}
              onChange={(e) => updateThemeColor('primary', e.target.value)}
            />
          </ColorCircleLabel>

          <ColorCircleLabel style={{ backgroundColor: themeObject.complementary }} htmlFor="complementary-color">
            <HiddenColorInput
              id="complementary-color"
              ref={complementaryInputRef}
              value={themeObject.complementary || '#f4787c'}
              onChange={(e) => updateThemeColor('complementary', e.target.value)}
            />
          </ColorCircleLabel>

          <ColorCircleLabel style={{ backgroundColor: themeObject.secondary }} htmlFor="secondary-color">
            <HiddenColorInput
              id="secondary-color"
              ref={secondaryInputRef}
              value={themeObject.secondary || '#ffffff'}
              onChange={(e) => updateThemeColor('secondary', e.target.value)}
            />
          </ColorCircleLabel>

          <ColorCircleLabel style={{ backgroundColor: themeObject.body }} htmlFor="background-color">
            <HiddenColorInput
              id="background-color"
              ref={backgroundInputRef}
              value={themeObject.body || '#ffffff'}
              onChange={(e) => updateThemeColor('body', e.target.value)}
            />
          </ColorCircleLabel>
        </>
      )}

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