import React, { useMemo, useContext } from 'react';
import styled from 'styled-components';
import { StyledSelect } from '@/components/Form.styles';
import { ThemeContext } from '@/context/ThemeContext';
import { Artwork } from '@/types';
import Link from 'next/link';
import StatSummary from './StatSummary';
import { FilterOptions, useFilterContext } from '@/context/FilterContext'; // <-- Gebruik de useFilterContext hook
import { atelierTheme, blueprintTheme, darkModeTheme, ThemeName } from '@/themes';
import { Theme } from '@/themes';
import { FaGripLines } from 'react-icons/fa'; // <-- Import the new icon

type SidebarProps = {
    isOpen: boolean;
    allArtworks: Artwork[];
}

const SidebarContainer = styled.aside<{$isOpen: boolean}>`
  width: 350px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.cardBg};
  border-right: 1px solid #ddd;
  padding: 2rem;
  overflow-y: auto;
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease-in-out;
  z-index: 101;

  @media (max-width: 1024px) {
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
`;

const SectionTitle = styled.h3`
    font-family: 'Lora', serif;
    color: ${({ theme }) => theme.accent};
    border-bottom: 2px solid ${({ theme }) => theme.accent};
    padding-bottom: 0.5rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
`;

const IntroText = styled.p`
  line-height: 1.7;
  color: ${({ theme }) => theme.text};
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

const Sidebar = ({ isOpen, allArtworks }: SidebarProps) => {
    const { filters, setFilters, searchTerm, setSearchTerm } = useFilterContext();
    const { theme, themeObject, toggleTheme, updateThemeColor, cardHeight, setCardHeight } = useContext(ThemeContext);

    const availableYears = useMemo(() => {
        const years = new Set(allArtworks.map(art => art.year));
        return Array.from(years).sort((a, b) => b - a);
    }, [allArtworks]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev: typeof filters) => ({ ...prev, [name]: value }));
    };

    return (
        <SidebarContainer $isOpen={isOpen}>
            <SectionTitle>Over Deze Site</SectionTitle>
            <IntroText>
                Welkom op mijn creatieve tijdlijn. Een persoonlijk archief van hersenspinsels, probeersels en creaties door de jaren heen.
            </IntroText>
            
            <SectionTitle>Filters</SectionTitle>
            <OptionGroup>
                <StyledSelect name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="all">Alle Categorieën</option>
                    <option value="poetry">Poetry</option>
                    <option value="prosepoetry">Prose Poetry</option>
                    <option value="prose">Prose</option>
                    <option value="music">Music</option>
                    <option value="sculpture">Sculpture</option>
                    <option value="drawing">Drawing</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                </StyledSelect>
                <StyledSelect name="year" value={filters.year} onChange={handleFilterChange}>
                    <option value="all">Alle Jaren</option>
                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </StyledSelect>
                 <SearchInput 
                    as="input"
                    type="text"
                    placeholder="Zoek op trefwoord..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
            </OptionGroup>

            <SectionTitle>Statistieken</SectionTitle>
            <StatSummary allArtworks={allArtworks} />
        </SidebarContainer>
    );
};

export default Sidebar;
