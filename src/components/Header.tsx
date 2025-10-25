import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useArtworks } from '@/context/ArtworksContext';
import styled from 'styled-components';
import { FaArrowLeft, FaArrowRight, FaPenNib, FaBookOpen, FaPaintBrush, FaMusic, FaAlignLeft, FaImage, FaVideo, FaEllipsisH, FaCube, FaGlobe, FaCertificate, FaStar } from 'react-icons/fa';
import ThemeEditor from './ThemeEditor'; // Importeren
import { MEDIUMS, MEDIUM_LABELS, SUBTYPE_LABELS } from '@/constants/medium';

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

const ToggleButton = styled.button`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  font-size: 1.5rem;
  margin-right: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.95;
  transition: color 0.2s, opacity 0.2s;
  &:hover {
    color: ${({ theme }) => theme.headerText};
    opacity: 1;
  }
`;

const RightSection = styled.div`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem; /* match IconsWrapper gap for consistent spacing */
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

const MediumIconButton = styled.button<{ $selected?: boolean }>`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: none;
  border: none;
  color: ${({ theme, $selected }) => $selected ? theme.primary : theme.secondary};
  font-size: 1.15rem;
  margin: 0 0.1rem;
  cursor: pointer;
  opacity: ${({ $selected }) => $selected ? 1 : 0.7};
  transition: color 0.2s, opacity 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  height: calc(1rem + 0.8rem);
  &:hover {
    color: ${({ theme }) => theme.primary};
    opacity: 1;
  }
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const Dropdown = styled.div<{ $closing?: boolean }>`
  position: absolute;
  top: calc(100% - 2px); /* Account for the padding-bottom */
  right: 0;
  background: ${({ theme }) => theme.body};
  border: 1px solid rgba(0,0,0,0.08);
  padding: 0.4rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 200;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
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

const DropdownButton = styled.button<{ $selected?: boolean }>`
  background: none;
  border: none;
  color: ${({ theme, $selected }) => $selected ? theme.primary : theme.secondary};
  padding: 0.35rem 0.5rem;
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.95rem;
  &:hover {
    color: ${({ theme }) => theme.primary};
    background: rgba(0,0,0,0.02);
  }
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
  const evalRef = useRef<HTMLDivElement | null>(null);
  const [evalMounted, setEvalMounted] = useState(false);
  const [evalClosing, setEvalClosing] = useState(false);

  // rating dropdown state
  const ratingRef = useRef<HTMLDivElement | null>(null);
  const [ratingMounted, setRatingMounted] = useState(false);
  const [ratingClosing, setRatingClosing] = useState(false);

  const closeEvalDropdown = useCallback(() => {
    if (!evalMounted) return;
    setEvalClosing(true);
    window.setTimeout(() => {
      setEvalMounted(false);
      setEvalClosing(false);
    }, 180);
  }, [evalMounted]);

  const toggleEvalDropdown = useCallback(() => {
    if (!evalMounted) {
      setEvalMounted(true);
      setEvalClosing(false);
    } else {
      closeEvalDropdown();
    }
  }, [evalMounted, closeEvalDropdown]);

  const closeRatingDropdown = useCallback(() => {
    if (!ratingMounted) return;
    setRatingClosing(true);
    window.setTimeout(() => {
      setRatingMounted(false);
      setRatingClosing(false);
    }, 180);
  }, [ratingMounted]);

  const toggleRatingDropdown = useCallback(() => {
    if (!ratingMounted) {
      setRatingMounted(true);
      setRatingClosing(false);
    } else {
      closeRatingDropdown();
    }
  }, [ratingMounted, closeRatingDropdown]);

  const handleDocumentClick = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    
    // Check if a click is outside a specific dropdown
    const isOutside = (ref: React.RefObject<HTMLDivElement | null>) => {
      return !ref.current || !ref.current.contains(target);
    };

    // Close dropdowns based on click location
    if (evalMounted && isOutside(evalRef)) {
      closeEvalDropdown();
    }
    if (ratingMounted && isOutside(ratingRef)) {
      closeRatingDropdown();
    }
  }, [evalMounted, ratingMounted, closeEvalDropdown, closeRatingDropdown]);

  const handleKeydown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeEvalDropdown();
      closeRatingDropdown();
    }
  }, [closeEvalDropdown, closeRatingDropdown]);

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleDocumentClick, handleKeydown]);

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
      <div style={{ width: '100%' }} data-testid="header-controls-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} data-testid="header-filters">
            <IconsWrapper data-testid="header-medium-icons">
              <MediumIconButton
                key="all"
                $selected={selectedMedium === 'all'}
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
                  $selected={selectedMedium === med}
                  title={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
                  aria-label={MEDIUM_LABELS[med as keyof typeof MEDIUM_LABELS]}
                  onClick={() => setSelectedMedium(selectedMedium === med ? 'all' : med)}
                  data-testid={`header-medium-${med}`}
                >
                  {MEDIUM_ICONS[med as keyof typeof MEDIUM_ICONS]}
                </MediumIconButton>
              ))}
            </IconsWrapper>
          </div>
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Zoeken..."
              style={{ padding: '0.4rem 0.8rem', borderRadius: 20, border: '1px solid #ccc', fontSize: '1rem' }}
              data-testid="header-search"
              aria-label="Zoek in kunstwerken"
              role="searchbox"
            />
          </div>
          <RightSection data-testid="header-theme-switcher">
            {/* evaluation filter (personal seals) */}
            <DropdownWrapper ref={evalRef}>
              <MediumIconButton
                title={'Filter op evaluatie'}
                aria-label="Filter op evaluatie"
                $selected={selectedEvaluation !== 'all'}
                onClick={() => toggleEvalDropdown()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleEvalDropdown(); } }}
                data-testid="header-filter-evaluation"
              >
                <FaCertificate />
              </MediumIconButton>
              {evalMounted && (
                <Dropdown $closing={evalClosing}>
                  {[5,4,3,2,1].map(n => (
                    <DropdownButton key={`eval-${n}`} onClick={() => { setSelectedEvaluation(selectedEvaluation === n ? 'all' : n); closeEvalDropdown(); }} $selected={selectedEvaluation !== 'all' && selectedEvaluation === n} title={`${n} seals of meer`} aria-label={`${n} seals of meer`}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', minWidth: '120px' }}>
                        <span style={{ display: 'inline-flex', gap: 4 }} aria-hidden>
                          {Array.from({length: n}).map((_,i) => <FaCertificate key={i} />)}
                        </span>
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{evalCounts[n] ?? 0}</div>
                      </div>
                    </DropdownButton>
                  ))}
                  <DropdownButton onClick={() => { setSelectedEvaluation('all'); closeEvalDropdown(); }} $selected={selectedEvaluation === 'all'} title="All evaluations" aria-label="All evaluations">All</DropdownButton>
                </Dropdown>
              )}
            </DropdownWrapper>

            {/* rating filter (public stars) */}
            <DropdownWrapper ref={ratingRef}>
              <MediumIconButton
                title={'Filter op beoordeling'}
                aria-label="Filter op beoordeling"
                $selected={selectedRating !== 'all'}
                onClick={() => toggleRatingDropdown()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRatingDropdown(); } }}
                data-testid="header-filter-rating"
              >
                <FaStar />
              </MediumIconButton>
              {ratingMounted && (
                <Dropdown $closing={ratingClosing}>
                  {[5,4,3,2,1].map(n => (
                    <DropdownButton key={`rating-${n}`} onClick={() => { setSelectedRating(selectedRating === n ? 'all' : n); closeRatingDropdown(); }} $selected={selectedRating !== 'all' && selectedRating === n} title={`${n} sterren of meer`} aria-label={`${n} sterren of meer`}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%', minWidth: '120px' }}>
                        <span style={{ display: 'inline-flex', gap: 4 }} aria-hidden>
                          {Array.from({length: n}).map((_,i) => <FaStar key={i} />)}
                        </span>
                        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{ratingCounts[n] ?? 0}</div>
                      </div>
                    </DropdownButton>
                  ))}
                  <DropdownButton onClick={() => { setSelectedRating('all'); closeRatingDropdown(); }} $selected={selectedRating === 'all'} title="All ratings" aria-label="All ratings">All</DropdownButton>
                </Dropdown>
              )}
            </DropdownWrapper>

            {/* Note: eval/rating counts are intentionally not shown on the main header; options show numbers inside the dropdown */}
            <ThemeEditor />
          </RightSection>
        </div>
      </div> {/* <-- Close the column flex div for title and toolbar */}
    </HeaderWrapper>
  );
};

export default Header;
