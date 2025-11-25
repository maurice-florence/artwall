"use client";
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { PageLayout, MainContent, NoResultsMessage } from '@/app/HomePage.styles';
import MasonryGrid from '@/components/ui/MasonryGrid';
import MobileNav from '@/components/MobileNav';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/ArtworkCard';
import YearMarkerCard from '@/components/YearMarker';
import Modal from '@/components/Modal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AdminModal from '@/components/AdminModal';
import NewEntryModal from '@/components/NewEntryModal';
import GlobalSpinner from '@/components/GlobalSpinner';
import type { Artwork, TimelineItem } from '@/types';

interface HomeFeedClientProps {
  allArtworks: Artwork[];
  initialFilters: {
    medium: string;
    year: string;
    evaluation: string | number;
    rating: string | number;
    q: string;
  };
}

export default function HomeFeedClient({ allArtworks, initialFilters }: HomeFeedClientProps) {
  // Expose allArtworks for AppInfoModal stats (client-only hack)
  if (typeof window !== 'undefined') {
    window.__ALL_ARTWORKS__ = allArtworks;
  }
  // Filters and admin state
  const [selectedMedium, setSelectedMedium] = useState<string>(initialFilters.medium || 'all');
  const [selectedYear, setSelectedYear] = useState<string>(initialFilters.year || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(initialFilters.q || '');
  const [selectedEvaluation, setSelectedEvaluation] = useState<'all' | number>(initialFilters.evaluation === 'all' ? 'all' : Number(initialFilters.evaluation));
  const [selectedRating, setSelectedRating] = useState<'all' | number>(initialFilters.rating === 'all' ? 'all' : Number(initialFilters.rating));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [editItem, setEditItem] = useState<Artwork | null>(null);
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [minWaitDone, setMinWaitDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Only for spinner logic

  // Debug: log spinner state and imageUrls overview
  useEffect(() => {
    const imageUrls = allArtworks
      .map(a => Array.isArray(a.coverImageUrl) ? a.coverImageUrl[0] : a.coverImageUrl)
      .filter(Boolean);
    // Only log once on mount or when allArtworks changes
    // Show count and a sample
    if (allArtworks.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[HomeFeedClient] imageUrls count:', imageUrls.length, 'Sample:', imageUrls.slice(0, 3));
      // eslint-disable-next-line no-console
      console.log('[HomeFeedClient] Spinner state:', { imagesLoaded, minWaitDone, isLoading, showSpinner: isLoading || !imagesLoaded || !minWaitDone });
    }
  }, [allArtworks, imagesLoaded, minWaitDone, isLoading]);


  // Spinner: show for at least 2s, but hide after 3s max (even if not loaded)
  useEffect(() => {
    if (allArtworks.length === 0) {
      setMinWaitDone(true);
      return;
    }
    const minTimer = setTimeout(() => setMinWaitDone(true), 2000);
    const maxTimer = setTimeout(() => {
      setMinWaitDone(true);
      setImagesLoaded(true);
      setIsLoading(false);
    }, 3000);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, [allArtworks.length]);

  // Wait for all images to load, or set imagesLoaded true if no artworks
  useEffect(() => {
    if (allArtworks.length === 0) {
      setImagesLoaded(true);
      return;
    }
    const imageUrls = allArtworks
      .map(a => Array.isArray(a.coverImageUrl) ? a.coverImageUrl[0] : a.coverImageUrl)
      .filter(Boolean);
    if (imageUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }
    let loadedCount = 0;
    imageUrls.forEach(url => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === imageUrls.length) {
          setImagesLoaded(true);
        }
      };
      img.src = url as string;
    });
  }, [allArtworks]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        setVisibleCount(prevCount => prevCount + 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setVisibleCount(60);
    }
  }, []);

  const availableMediums = useMemo(() => {
    const meds = new Set(allArtworks.map((a: Artwork) => a.medium));
    return (Array.from(meds) as string[]).filter(med => typeof med === 'string');
  }, [allArtworks]);
  const availableYears = useMemo(() => {
    const years = new Set(allArtworks.map((a: Artwork) => a.year.toString()));
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [allArtworks]);

  const handleMediumToggle = (med: string) => {
    setSelectedMedium(prev => prev === med ? 'all' : med);
  };
  const handleYearToggle = (year: string) => {
    setSelectedYear(prev => prev === year ? 'all' : year);
  };

  const filtered = allArtworks.filter((artwork: Artwork) => {
    if (!isAdmin && artwork.isHidden) return false;
    const mediumMatch = selectedMedium === 'all' || artwork.medium === selectedMedium;
    const yearMatch = selectedYear === 'all' || artwork.year.toString() === selectedYear;
    const q = searchTerm.trim().toLowerCase();
    const titleText = (artwork.title || '').toString().toLowerCase();
    const descText = (artwork.description || '').toString().toLowerCase();
    const searchMatch = q === '' ? true : titleText.includes(q) || descText.includes(q);
    const normalizedEval = (artwork as any).evaluationNum;
    const rawEval = (artwork as any).evaluation;
    const evalVal = typeof normalizedEval === 'number' ? normalizedEval : (typeof rawEval === 'number' ? rawEval : (rawEval && rawEval !== '' ? Number(rawEval) : NaN));
    const evaluationMatch = selectedEvaluation === 'all' ? true : (!isNaN(evalVal) && evalVal >= (selectedEvaluation as number));
    const normalizedRating = (artwork as any).ratingNum;
    const rawRating = (artwork as any).rating;
    const ratingVal = typeof normalizedRating === 'number' ? normalizedRating : (typeof rawRating === 'number' ? rawRating : (rawRating && rawRating !== '' ? Number(rawRating) : NaN));
    const ratingMatch = selectedRating === 'all' ? true : (!isNaN(ratingVal) && ratingVal >= (selectedRating as number));
    return mediumMatch && yearMatch && searchMatch && evaluationMatch && ratingMatch;
  });

  const sorted = filtered.sort((a: Artwork, b: Artwork) => {
    const dateA = new Date(a.year, (a.month || 1) - 1, a.day || 1).getTime();
    const dateB = new Date(b.year, (b.month || 1) - 1, b.day || 1).getTime();
    return dateB - dateA;
  });

  // --- Improved: Reorder artworks for each year so large cards come first (minimize grid gaps) ---
  const cardSizes: { [key: string]: { gridColumn: number; gridRow: number } } = {
    default: { gridColumn: 1, gridRow: 1 },
    novel: { gridColumn: 2, gridRow: 1 },
    prose: { gridColumn: 4, gridRow: 4 }
  };
  function getCardArea(subtype: string) {
    const size = cardSizes[subtype] || cardSizes.default;
    return size.gridColumn * size.gridRow;
  }
  const timelineItems: TimelineItem[] = (() => {
    const itemsWithYearMarkers: TimelineItem[] = [];
    let lastYear: number | null = null;
    // Group by year
    const byYear: { [year: number]: Artwork[] } = {};
    sorted.forEach((artwork: Artwork) => {
      if (!byYear[artwork.year]) byYear[artwork.year] = [];
      byYear[artwork.year].push(artwork);
    });
    // For each year, insert marker, then artworks sorted by area (largest first)
    Object.keys(byYear).sort((a, b) => Number(b) - Number(a)).forEach(yearStr => {
      const year = Number(yearStr);
      itemsWithYearMarkers.push({
        id: `year-${year}`,
        type: 'year-marker',
        year
      });
      const group = byYear[year];
      group.sort((a, b) => {
        const areaA = getCardArea((a.subtype || 'default').toLowerCase());
        const areaB = getCardArea((b.subtype || 'default').toLowerCase());
        return areaB - areaA;
      });
      group.forEach(artwork => itemsWithYearMarkers.push(artwork));
    });
    return itemsWithYearMarkers;
  })();

  const handleSaveNewEntry = async (entry: any) => {
    // TODO: Implement server action for new entry
    alert('Server action for new entry coming soon!');
  };

  const handleEdit = useCallback((artwork: Artwork) => {
    setArtworkToEdit(prev => {
      if (!prev || prev.id !== artwork.id) {
        return artwork;
      }
      return prev;
    });
  }, []);
  const handleAdd = () => {
    setArtworkToEdit(null);
    setIsAdminModalOpen(true);
  };

  function isArtwork(item: TimelineItem): item is Artwork {
    return (item as Artwork).medium !== undefined;
  }

  const showSpinner = isLoading || !imagesLoaded || !minWaitDone;

  return (
    <PageLayout>
      {/* Accessibility: Skip to Content link */}
      <a href="#main-content" style={{ position: 'absolute', left: 0, top: 0, background: '#fff', color: '#0070f3', padding: '8px', zIndex: 1000, transform: 'translateY(-200%)', transition: 'transform 0.2s', outline: 'none' }}
        onFocus={e => (e.currentTarget.style.transform = 'translateY(0)')}
        onBlur={e => (e.currentTarget.style.transform = 'translateY(-200%)')}
      >
        Skip to Content
      </a>
      {showSpinner && <GlobalSpinner />}
      {/* aria-live region for infinite scroll announcements */}
      <div aria-live="polite" aria-atomic="true" id="infinite-scroll-announcer" style={{ position: 'absolute', left: '-9999px', height: '1px', width: '1px', overflow: 'hidden' }}>
        {/* This will be updated by infinite scroll logic if needed */}
      </div>
      {!showSpinner && (
        allArtworks.length === 0 ? (
          <MainContent id="main-content">
            <NoResultsMessage>Geen kunstwerken gevonden.</NoResultsMessage>
          </MainContent>
        ) : (
          <MainContent id="main-content">
            <MobileNav artworks={allArtworks} />
            <Header
              selectedMedium={selectedMedium}
              setSelectedMedium={setSelectedMedium}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableMediums={availableMediums}
              availableYears={availableYears}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedEvaluation={selectedEvaluation}
              setSelectedEvaluation={setSelectedEvaluation}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              artworksForCounts={allArtworks}
            />
            <MasonryGrid>
              {timelineItems.slice(0, visibleCount).map((item: TimelineItem) => {
                if ('type' in item && item.type === 'year-marker') {
                  return <YearMarkerCard key={item.id} year={item.year} />;
                }
                if (isArtwork(item)) {
                  return <ArtworkCard key={item.id} artwork={item as Artwork} onSelect={() => {
                    setSelectedItem(item as Artwork);
                    if (isAdmin) handleEdit(item as Artwork);
                  }} isAdmin={isAdmin} />;
                }
                return null;
              })}
            </MasonryGrid>
            <Footer onAddNewArtwork={handleAdd} />
          </MainContent>
        )
      )}
      {selectedItem && (
        <Modal
          item={selectedItem as Artwork}
          onClose={() => setSelectedItem(null)}
          isAdmin={isAdmin}
          onEdit={(item: Artwork) => {
            setEditItem(item);
            setShowNewEntryModal(true);
            setSelectedItem(null);
          }}
          isOpen={!!selectedItem}
        />
      )}
      <ErrorBoundary>
        {isAdminModalOpen && (
          <AdminModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            artworkToEdit={artworkToEdit}
          />
        )}
      </ErrorBoundary>
      <NewEntryModal
        isOpen={showNewEntryModal}
        onClose={() => {
          setShowNewEntryModal(false);
          setEditItem(null);
        }}
        onSave={handleSaveNewEntry}
        editItem={editItem}
      />
    </PageLayout>
  );
}
