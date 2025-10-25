import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useArtworks } from '@/context/ArtworksContext';
import styled from 'styled-components';
import { FaPenNib, FaPaintBrush, FaMusic, FaEllipsisH, FaCube, FaGlobe, FaCertificate, FaStar, FaSearch } from 'react-icons/fa';
import ThemeEditor from './ThemeEditor';
import { MEDIUMS, MEDIUM_LABELS, SUBTYPE_LABELS } from '@/constants/medium';
import { useDropdown } from '@/hooks/useDropdown';
import { BaseIconButton, Dropdown } from './common';

const HeaderWrapper = styled.header`
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.headerText};
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const Title = styled.h1`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 3.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  margin: 0;
`;

const RightSection = styled.div`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem; /* match IconsWrapper gap for consistent spacing */
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 1rem;
  color: ${({ theme }) => theme.secondary};
  pointer-events: none;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem 0.5rem 2.5rem; /* Left padding for icon */
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}30;
  }
`;

const IconsWrapper = styled.div`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MEDIUM_ICONS: Record<string, React.ReactNode> = {
  'audio': <FaMusic />,
  'writing': <FaPenNib />,
  'drawing': <FaPaintBrush />,
  'sculpture': <FaCube />,
  'other': <FaEllipsisH />,
};

const MediumIconButton = styled(BaseIconButton)``;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownButton = styled.button<{ $active?: boolean }>`
  background: none;
  border: none;
  color: ${({ theme, $active }) => $active ? theme.primary : theme.secondary};
  padding: 0.35rem 0.5rem;
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: color 0.2s, background 0.2s;
  &:hover {
    color: ${({ theme }) => theme.primary};
    background: rgba(0,0,0,0.02);
  }
  ${({ $active }) => $active ? `opacity: 1;` : `opacity: 0.85;`}
`;

interface HeaderProps {
  selectedMedium: string;
  setSelectedMedium: (med: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableMediums: string[];
  availableYears: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // New: evaluation and rating filters (1-5 or 'all')
  selectedEvaluation: number | 'all';
  setSelectedEvaluation: (n: number | 'all') => void;
  selectedRating: number | 'all';
  setSelectedRating: (n: number | 'all') => void;
}


const Header: React.FC<HeaderProps> = ({
  selectedMedium,
  setSelectedMedium,
  selectedYear,
  setSelectedYear,
  availableMediums,
  availableYears,
  searchTerm,
  setSearchTerm,
  selectedEvaluation,
  setSelectedEvaluation,
  selectedRating,
  setSelectedRating,
}) => {
  // evaluation dropdown state
  const evalRef = useRef<HTMLDivElement>(null);
  const { isMounted: evalMounted, isClosing: evalClosing, toggle: toggleEvalDropdown, close: closeEvalDropdown } = useDropdown(evalRef);

  // rating dropdown state
  const ratingRef = useRef<HTMLDivElement>(null);
  const { isMounted: ratingMounted, isClosing: ratingClosing, toggle: toggleRatingDropdown, close: closeRatingDropdown } = useDropdown(ratingRef);

  // Dev-only counts badge
  const devEvalCount = (window as any).__dev_eval_count__ ?? null;
  const devRatingCount = (window as any).__dev_rating_count__ ?? null;

  // Calculate counts for each filter option using the artworks from context
  const { artworks } = useArtworks();

  const evalCounts = useMemo(() => {
    const counts: Record<number, number> = {5:0,4:0,3:0,2:0,1:0};
    if (!artworks || artworks.length === 0) return counts;
    for (const a of artworks) {
      const normalizedEval = (a as any).evaluationNum;
      const rawEval = (a as any).evaluation;
      const evalVal = typeof normalizedEval === 'number' ? normalizedEval : (typeof rawEval === 'number' ? rawEval : (rawEval && rawEval !== '' ? Number(rawEval) : NaN));
      if (!isNaN(evalVal)) {
        for (const n of [1,2,3,4,5]) {
          if (evalVal >= n) counts[n] = (counts[n] || 0) + 1;
        }
      }
    }
    return counts;
  }, [artworks]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = {5:0,4:0,3:0,2:0,1:0};
    if (!artworks || artworks.length === 0) return counts;
    for (const a of artworks) {
      const normalizedRating = (a as any).ratingNum;
      const rawRating = (a as any).rating;
      const ratingVal = typeof normalizedRating === 'number' ? normalizedRating : (typeof rawRating === 'number' ? rawRating : (rawRating && rawRating !== '' ? Number(rawRating) : NaN));
      if (!isNaN(ratingVal)) {
        for (const n of [1,2,3,4,5]) {
          if (ratingVal >= n) counts[n] = (counts[n] || 0) + 1;
        }
      }
    }
    return counts;
  }, [artworks]);
  return (
    <HeaderWrapper data-testid="header">
      <TitleRow data-testid="header-title-row">
        <Title data-testid="header-title">Artwall</Title>
      </TitleRow>
      {/* Second row: filters, icons, search, theme */}
      <ControlsRow data-testid="header-controls-row">
          <IconsWrapper data-testid="header-medium-icons">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} data-testid="header-filters">
              <MediumIconButton
                key="all-mediums"
                $active={selectedMedium === 'all'}
                title="All mediums"
                aria-label="All mediums"
                onClick={() => setSelectedMedium('all')}
                data-testid="header-medium-all"
              >
                <FaGlobe />
              </MediumIconButton>
              {([...(availableMediums.length > 0 ? availableMediums : MEDIUMS).filter(m => m !== 'other'), 'other']).map((med) => (
                <MediumIconButton
                  key={med}
                  $active={selectedMedium === med}
                  title={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
                  aria-label={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
                  onClick={() => setSelectedMedium(selectedMedium === med ? 'all' : med)}
                  data-testid={`header-medium-${med}`}
                >
                  {MEDIUM_ICONS[med as keyof typeof MEDIUM_ICONS]}
                </MediumIconButton>
              ))}
            </div>
          </IconsWrapper>
          <SearchWrapper>
            <SearchIcon />
            <SearchInput
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search..."
              data-testid="header-search"
              aria-label="Zoek in kunstwerken"
            />
          </SearchWrapper>
          <RightSection data-testid="header-theme-switcher">
            {/* evaluation filter (personal seals) */}
            <DropdownWrapper ref={evalRef}>
              <MediumIconButton
                title={'Filter op evaluatie'}
                aria-label="Filter op evaluatie"
                $active={selectedEvaluation !== 'all'}
                onClick={() => toggleEvalDropdown()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEvalDropdown(); } }}
                data-testid="header-filter-evaluation"
              >
                <FaCertificate />
              </MediumIconButton>
              {evalMounted && (
                <Dropdown $closing={evalClosing}>
                  {[5,4,3,2,1].map(n => (
                    <DropdownButton key={`eval-${n}`} onClick={() => { setSelectedEvaluation(selectedEvaluation === n ? 'all' : n); closeEvalDropdown(); }} $active={selectedEvaluation !== 'all' && selectedEvaluation === n} title={`${n} seals of meer`} aria-label={`${n} seals of meer`}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', minWidth: '120px' }}>
                        <span style={{ display: 'inline-flex', gap: 4 }} aria-hidden>
                          {Array.from({length: n}).map((_,i) => <FaCertificate key={i} />)}
                        </span>
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{evalCounts[n] ?? 0}</div>
                      </div>
                    </DropdownButton>
                  ))}
                  <DropdownButton onClick={() => { setSelectedEvaluation('all'); closeEvalDropdown(); }} $active={selectedEvaluation === 'all'} title="All evaluations" aria-label="All evaluations">All</DropdownButton>
                </Dropdown>
              )}
            </DropdownWrapper>

            {/* rating filter (public stars) */}
            <DropdownWrapper ref={ratingRef}>
              <MediumIconButton
                title={'Filter op beoordeling'}
                aria-label="Filter op beoordeling"
                $active={selectedRating !== 'all'}
                onClick={() => toggleRatingDropdown()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRatingDropdown(); } }}
                data-testid="header-filter-rating"
              >
                <FaStar />
              </MediumIconButton>
              {ratingMounted && (
                <Dropdown $closing={ratingClosing}>
                  {[5,4,3,2,1].map(n => (
                    <DropdownButton key={`rating-${n}`} onClick={() => { setSelectedRating(selectedRating === n ? 'all' : n); closeRatingDropdown(); }} $active={selectedRating !== 'all' && selectedRating === n} title={`${n} sterren of meer`} aria-label={`${n} sterren of meer`}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', minWidth: '120px' }}>
                        <span style={{ display: 'inline-flex', gap: 4 }} aria-hidden>
                          {Array.from({length: n}).map((_,i) => <FaStar key={i} />)}
                        </span>
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{ratingCounts[n] ?? 0}</div>
                      </div>
                    </DropdownButton>
                  ))}
                  <DropdownButton onClick={() => { setSelectedRating('all'); closeRatingDropdown(); }} $active={selectedRating === 'all'} title="All ratings" aria-label="All ratings">All</DropdownButton>
                </Dropdown>
              )}
            </DropdownWrapper>

            {/* Note: eval/rating counts are intentionally not shown on the main header; options show numbers inside the dropdown */}
            <ThemeEditor />
          </RightSection>
      </ControlsRow>
    </HeaderWrapper>
  );
};

export default Header;
