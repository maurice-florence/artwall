import React, { useMemo, useContext } from 'react';
import styled from 'styled-components';
import { StyledSelect } from '@/components/Form.styles';
import { ThemeContext } from '@/context/ThemeContext';
import { Artwork } from '@/types';
import Link from 'next/link';
import StatSummary from './StatSummary';
// import { useFilterContext } from '@/context/FilterContext'; // Filter logic removed
import { atelierTheme, blueprintTheme, darkModeTheme, ThemeName } from '@/themes';
import { Theme } from '@/themes';
import { FaGripLines } from 'react-icons/fa'; // <-- Import the new icon

type SidebarProps = {
    isOpen: boolean;
    allArtworks: Artwork[];
    openModal?: () => void;
}

const SidebarContainer = styled.aside<{$isOpen: boolean}>`
  width: 350px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.body || '#f5f5f5'};
  color: ${({ theme }) => theme.text || '#222'};
  border-right: 1px solid #ddd;
  padding: 2rem;
  overflow-y: auto;
  z-index: 101;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);

  @media (max-width: 1024px) {
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
`;

const SectionTitle = styled.h3`
    font-family: 'Lora', serif;
    color: ${({ theme }) => theme.accentText || theme.accent};
    border-bottom: 2px solid ${({ theme }) => theme.accent};
    padding-bottom: 0.5rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
`;

const IntroText = styled.p`
  line-height: 1.7;
  color: ${({ theme }) => theme.text || '#222'};
  font-size: 0.9rem;
`;

const OptionGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
`;

const OptionRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
`;

const ToggleButtonGroup = styled.div`
    display: flex;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
`;

const ToggleButton = styled.button<{$active: boolean}>`
    padding: 0.5rem 0.75rem;
    border: none;
    background-color: ${props => props.$active ? props.theme.accent : 'transparent'};
    color: ${props => props.$active ? props.theme.accentText : props.theme.text};
    cursor: pointer;
    transition: background-color 0.2s;

    &:not(:last-child) {
        border-right: 1px solid #ccc;
    }
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
`;

const ThemeButton = styled.button<{$active: boolean; color: string;}>`
    width: 25px;
    height: 25px;
    border-radius: 50%;
    border: 2px solid ${props => props.$active ? props.theme.accent : '#ccc'};
    cursor: pointer;
    background-color: ${props => props.color};
    transition: border-color 0.2s;
`;

const SearchInput = styled(StyledSelect)``;

const ColorPickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;
const ColorLabel = styled.label`
  min-width: 90px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
`;

const themeOptions: { name: ThemeName; color: string; label: string }[] = [
  { name: 'atelier', color: atelierTheme.accent, label: 'Atelier' },
  { name: 'blueprint', color: blueprintTheme.accent, label: 'Blueprint' },
  { name: 'dark', color: darkModeTheme.accent, label: 'Donker' },
];

const Sidebar = ({ isOpen, allArtworks, openModal }: SidebarProps) => {
    // Import medium-subtypes.json
    const mediumSubtypes = {
      drawing: ["digital", "marker", "other", "pencil"],
      writing: ["essay", "novel", "other", "poem", "prosepoem", "shortstory"],
      audio: ["beat", "electronic", "other", "rap", "song", "soundpoem"],
      sculpture: ["clay", "other", "wood"],
      other: ["other"]
    };

    return (
        <SidebarContainer $isOpen={isOpen} data-testid="sidebar">
            <div>
                <h2 data-testid="sidebar-title" style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#444' }}>Welkom bij Kunstmuur</h2>
                <IntroText data-testid="sidebar-intro">
                    Dit is een digitale kunstmuur waar je een overzicht vindt van alle werken, gesorteerd op jaar en medium. Gebruik de knoppen bovenaan om te filteren op medium, of zoek op titel/omschrijving. Klik op een werk voor meer details, media en vertalingen.
                </IntroText>
                <IntroText data-testid="sidebar-intro-italic" style={{ marginTop: '1rem', fontStyle: 'italic', color: '#888' }}>
                    Je kunt altijd terugkeren naar het volledige overzicht door de filter op 'Alle mediums' te zetten.
                </IntroText>
                <SectionTitle>Mediums & Subtypes</SectionTitle>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(mediumSubtypes).map(([medium, subtypes]) => (
                    <li key={medium} style={{ marginBottom: '1.2rem' }}>
                      <strong style={{ color: '#E07A5F', fontSize: '1rem' }}>{medium.charAt(0).toUpperCase() + medium.slice(1)}</strong>
                      <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, fontSize: '0.95rem', color: '#555' }}>
                        {subtypes.map(sub => (
                          <li key={sub} style={{ marginBottom: '0.2rem' }}>{sub}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                {openModal && (
                  <button data-testid="open-adminmodal" onClick={openModal}>Open Admin Modal</button>
                )}
            </div>
        </SidebarContainer>
    );
};

export default Sidebar;
