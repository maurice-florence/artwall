import React, { useMemo, useContext, Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '@/context/ThemeContext';
import { Artwork, FilterOptions, ViewOptions } from '@/components/types';

const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  width: 350px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.cardBg};
  border-right: 1px solid #ddd;
  padding: 2rem;
  overflow-y: auto;
  transform: ${(props) => (props.$isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-in-out;
  z-index: 101;

  @media (max-width: 1024px) {
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
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

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 0.75rem;
  border: none;
  background-color: ${(props) => (props.$active ? props.theme.accent : 'transparent')};
  color: ${(props) => (props.$active ? props.theme.accentText : props.theme.text)};
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

const ThemeButton = styled.button<{ $active: boolean; color: string }>`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: 2px solid ${(props) => (props.$active ? props.theme.accent : '#ccc')};
  cursor: pointer;
  background-color: ${(props) => props.color};
  transition: border-color 0.2s;
`;

// Locally defined styled select to replace StyledFilterSelect
const StyledSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  font-size: 1rem;
  background: ${({ theme }) => (theme && (theme as any).colors?.backgroundSecondary) || '#fff'};
  color: ${({ theme }) => (theme && (theme as any).colors?.textPrimary) || '#222'};
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
`;

interface SidebarProps {
  isOpen: boolean;
  allArtworks: Artwork[];
  filters: FilterOptions;
  setFilters: Dispatch<SetStateAction<FilterOptions>>;
  viewOptions: ViewOptions;
  setViewOptions: Dispatch<SetStateAction<ViewOptions>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

const Sidebar = ({
  isOpen,
  allArtworks,
  filters,
  setFilters,
  viewOptions,
  setViewOptions,
  searchTerm,
  setSearchTerm,
}: SidebarProps) => {
  const { toggleTheme } = useContext(ThemeContext);

  const availableYears = useMemo(() => {
    const years = new Set<number>(allArtworks.map((art: Artwork) => art.year));
    return Array.from(years).sort((a, b) => (b as number) - (a as number));
  }, [allArtworks]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: FilterOptions) => ({ ...prev, [name]: value }));
  };

  const handleViewOptionChange = (option: keyof ViewOptions, value: any) => {
    setViewOptions((prev: ViewOptions) => ({ ...prev, [option]: value }));
  };

  return (
    <SidebarContainer $isOpen={isOpen}>
      <SectionTitle>Over Deze Site</SectionTitle>
      <IntroText>
        Welkom op mijn creatieve tijdlijn. Een persoonlijk archief van hersenspinsels, probeersels
        en creaties door de jaren heen.
      </IntroText>

      <SectionTitle>Filters</SectionTitle>
      <OptionGroup>
        <StyledSelect name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="all">Alle Categorieën</option>
          <option value="poëzie">Poëzie</option>
          <option value="proza">Proza</option>
          <option value="sculptuur">Sculptuur</option>
          <option value="tekening">Tekening</option>
          <option value="muziek">Muziek</option>
        </StyledSelect>
        <StyledSelect name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="all">Alle Jaren</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </StyledSelect>
        <SearchInput
          type="text"
          placeholder="Zoek op trefwoord..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
      </OptionGroup>
    </SidebarContainer>
  );
};

export default Sidebar;
