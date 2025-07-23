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
    color: ${({ theme }) => theme.text || '#444'};
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
  { name: 'blueprint', color: blueprintTheme.accent, label: 'Blueprint' },
  { name: 'dark', color: darkModeTheme.accent, label: 'Donker' },
];

const Sidebar = ({ isOpen, allArtworks, openModal }: SidebarProps) => {
    // Medium/subtypes list removed as requested.
const AboutImage = styled.img`
  display: block;
  max-width: 180px;
  height: auto;
  margin: 2rem auto 1.5rem auto;
  border-radius: 16px;
  border: 4px double #111;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
`;

    return (
        <SidebarContainer $isOpen={isOpen} data-testid="sidebar">
            <div>
                <AboutImage src="/20120515_drawing_jan_01.jpg" alt="About artwork" />
                <SectionTitle>About</SectionTitle>
                <IntroText>
                  In the swirling mists of digital legend, there exists a figure known as <b>Onbevangene</b>.<br/><br/>
                  Born from a cosmic collision between a sketchbook and a quantum computer, The Friem is rumored to have once debugged a painting and painted a bug, all before breakfast.
                  Their hobbies include: teaching neural networks to appreciate dada poetry, inventing new colors that only exist on Tuesdays, and composing symphonies for silent keyboards.
                  Some say The Friem can refactor reality itself, and that their favorite snack is the elusive Schrödinger’s Stroopwafel—simultaneously eaten and uneaten.
                  Welcome to the Artwall, where The Friem’s creative entropy is carefully curated for the delight of future generations (and the occasional befuddled AI).
                </IntroText>
            </div>
        </SidebarContainer>
    );
};

export default Sidebar;
