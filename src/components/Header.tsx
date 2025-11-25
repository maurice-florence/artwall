import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { FaPenNib, FaPaintBrush, FaMusic, FaEllipsisH, FaCube, FaGlobe, FaCertificate, FaStar, FaSearch, FaInfoCircle } from 'react-icons/fa';
import ThemeEditor from './ThemeEditor';
import AppInfoModal from './AppInfoModal';
import { MEDIUM_LABELS, SUBTYPE_LABELS, getSubtypesForMedium, MEDIUMS } from '@/constants/medium';
import { useDropdown } from '@/hooks/useDropdown';
import { BaseIconButton, Dropdown } from './common';
import useIsMobile from '@/hooks/useIsMobile';
import type { Artwork } from '@/types';


const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
const gitCommit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '';

// --- Artwork Stats Helper ---
function getArtworkStats(artworks: Artwork[]) {
  if (!artworks || artworks.length === 0) return null;
  // Total
  const total = artworks.length;
  // Per category
  const byMedium: { [key: string]: number } = {};
  // Per subcategory
  const bySubtype: { [key: string]: number } = {};
  // Date range
  let minDate = null, maxDate = null;
  // Year histogram
  const yearCounts: { [key: number]: number } = {};
  // Most common medium/subtype
  for (const a of artworks) {
    // Medium
    byMedium[a.medium] = (byMedium[a.medium] || 0) + 1;
    // Subtype
    if (a.subtype) {
      bySubtype[a.subtype] = (bySubtype[a.subtype] || 0) + 1;
    }
    // Date
    if (a.year && a.month && a.day) {
      const d = new Date(a.year, a.month - 1, a.day);
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }
    // Year histogram
    if (a.year) yearCounts[a.year] = (yearCounts[a.year] || 0) + 1;
  }
  // Most common medium/subtype
  let mostMedium = null, mostMediumCount = 0;
  for (const m in byMedium) {
    if (byMedium[m] > mostMediumCount) {
      mostMedium = m;
      mostMediumCount = byMedium[m];
    }
  }
  let mostSubtype = null, mostSubtypeCount = 0;
  for (const s in bySubtype) {
    if (bySubtype[s] > mostSubtypeCount) {
      mostSubtype = s;
      mostSubtypeCount = bySubtype[s];
    }
  }
  // Years range
  const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
  return {
    total,
    byMedium,
    bySubtype,
    minDate,
    maxDate,
    yearCounts,
    years,
    mostMedium,
    mostMediumCount,
    mostSubtype,
    mostSubtypeCount,
  };
}




// Info button for app info modal
const InfoButton = styled.button`
  background: none;
  border: none;
  color: #0b8783;
  font-size: 1.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  padding: 0.3em 0.5em;
  transition: background 0.2s;
  &:hover {
    background: rgba(11,135,131,0.08);
  }
`;

const HeaderWrapper = styled.header`
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.headerText};
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 100;
  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const Title = styled.h1`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 2.4rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  margin: 0;
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const RightSection = styled.div`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem; /* match IconsWrapper gap for consistent spacing */
  @media (max-width: 768px) {
    justify-content: flex-start; /* left align on mobile */
    order: 2; /* second row on mobile */
    flex-wrap: wrap;
    width: 100%;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    width: 100%;
    order: 3; /* search last on mobile */
  }
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
  @media (max-width: 768px) {
    width: 100%;
    font-size: 0.95rem;
  }
`;

const IconsWrapper = styled.div`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 768px) {
    order: 1; /* first row on mobile */
    justify-content: flex-start; /* left align on mobile */
    flex-wrap: wrap;
    width: 100%;
  }
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

// Removed duplicate interface HeaderProps
interface HeaderProps {
  selectedMedium: string;
  setSelectedMedium: (med: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableMediums: string[];
  availableYears: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedEvaluation: number | 'all';
  setSelectedEvaluation: (n: number | 'all') => void;
  selectedRating: number | 'all';
  setSelectedRating: (n: number | 'all') => void;
  artworksForCounts?: Artwork[];
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
  artworksForCounts,
}) => {
  
  // ...existing code...
  const [infoOpen, setInfoOpen] = useState(false);
  const isMobile = useIsMobile();
  // evaluation dropdown state
  const evalRef = useRef<HTMLDivElement>(null);
  const { isMounted: evalMounted, isClosing: evalClosing, toggle: toggleEvalDropdown, close: closeEvalDropdown } = useDropdown(evalRef);

  // rating dropdown state
  const ratingRef = useRef<HTMLDivElement>(null);
  const { isMounted: ratingMounted, isClosing: ratingClosing, toggle: toggleRatingDropdown, close: closeRatingDropdown } = useDropdown(ratingRef);

  // Dev-only counts badge (guard for SSR)
  const devEvalCount = typeof window !== 'undefined' ? (window as any).__dev_eval_count__ ?? null : null;
  const devRatingCount = typeof window !== 'undefined' ? (window as any).__dev_rating_count__ ?? null : null;

  // Calculate counts for each filter option using the artworks from context
  const sourceArtworks: Artwork[] = useMemo(() => (artworksForCounts ?? []), [artworksForCounts]);

  const evalCountsComputed = useMemo(() => {
    const counts: Record<number, number> = {5:0,4:0,3:0,2:0,1:0};
    if (!artworksForCounts || artworksForCounts.length === 0) return counts;
    for (const a of artworksForCounts) {
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
  }, [artworksForCounts]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = {5:0,4:0,3:0,2:0,1:0};
    if (!artworksForCounts || artworksForCounts.length === 0) return counts;
    for (const a of artworksForCounts) {
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
  }, [artworksForCounts]);
  // ...existing code...
  return (
    <HeaderWrapper data-testid="header">
      <TitleRow data-testid="header-title-row">
        <Title data-testid="header-title">Artwall</Title>
      </TitleRow>
      {/* Second row: filters, icons, search, theme */}
      <ControlsRow data-testid="header-controls-row" data-stacked={isMobile ? 'true' : 'false'}>
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
          <SearchWrapper data-fullwidth={isMobile ? 'true' : 'false'}>
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
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{evalCountsComputed[n] ?? 0}</div>
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
            <InfoButton title="App informatie" aria-label="App informatie" onClick={() => setInfoOpen(true)}>
              <FaInfoCircle />
            </InfoButton>
            {/* Compute and pass artwork stats to modal */}
            <AppInfoModal
              open={infoOpen}
              onClose={() => setInfoOpen(false)}
              version={appVersion}
              commit={gitCommit}
              extraInfo={(() => {
                // Try to get all artworks from HomeFeedClient if available
                let artworks: Artwork[] = [];
                if (typeof window !== 'undefined' && window.__ALL_ARTWORKS__) {
                  artworks = window.__ALL_ARTWORKS__;
                }
                // Fallback: try to find in DOM or context (not robust, but avoids SSR issues)
                if (!artworks || artworks.length === 0) return null;
                const stats = getArtworkStats(artworks);
                if (!stats) return null;
                return (
                  <div style={{marginTop: '1.5em', fontSize: '0.98em'}}>
                    <h3 style={{marginBottom: 8}}>Database Statistieken</h3>
                    <div><strong>Totaal aantal werken:</strong> {stats.total}</div>
                    <div style={{marginTop: 6}}><strong>Per categorie:</strong></div>
                    <ul style={{margin: 0, paddingLeft: 18}}>
                      {Object.entries(stats.byMedium).map(([m, count]) => (
                        <li key={m}>{MEDIUM_LABELS[m] || m}: {count}</li>
                      ))}
                    </ul>
                    <div style={{marginTop: 6}}><strong>Per subcategorie:</strong></div>
                    <ul style={{margin: 0, paddingLeft: 18, columns: 2, fontSize: '0.97em'}}>
                      {Object.entries(stats.bySubtype).map(([s, count]) => (
                        <li key={s}>{SUBTYPE_LABELS[s] || s}: {count}</li>
                      ))}
                    </ul>
                    <div style={{marginTop: 6}}><strong>Jaren:</strong> {stats.years[0]} – {stats.years[stats.years.length-1]}</div>
                    <div><strong>Eerste werk:</strong> {stats.minDate ? stats.minDate.toLocaleDateString() : 'n.v.t.'}</div>
                    <div><strong>Laatste werk:</strong> {stats.maxDate ? stats.maxDate.toLocaleDateString() : 'n.v.t.'}</div>
                    <div style={{marginTop: 6}}><strong>Meest voorkomende categorie:</strong> {stats.mostMedium ? (MEDIUM_LABELS[stats.mostMedium] || stats.mostMedium) : '-'} ({stats.mostMediumCount})</div>
                    <div><strong>Meest voorkomende subcategorie:</strong> {stats.mostSubtype ? (SUBTYPE_LABELS[stats.mostSubtype] || stats.mostSubtype) : '-'} ({stats.mostSubtypeCount})</div>
                  </div>
                );
              })()}
            />
          </RightSection>
      </ControlsRow>
    </HeaderWrapper>
  );
};

export default Header;
