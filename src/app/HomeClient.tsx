"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import styled from 'styled-components';
import { SpinnerConfig } from '@/config/spinner';
import usePageSpinner from '@/hooks/usePageSpinner';
import { 
  PageLayout, MainContent, CollageContainer
} from '@/app/HomePage.styles';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import MobileNav from '@/components/MobileNav';
import ArtworkCard from '@/components/ArtworkCard';
import YearMarkerCard from '@/components/YearMarker';
import toast from 'react-hot-toast';
import { Artwork, TimelineItem } from '@/types';
import dynamic from 'next/dynamic';

function ModalFallback() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kunstwerkdetails laden"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(61, 64, 91, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.9)',
          color: '#333',
          padding: '1rem 1.25rem',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 14,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 18,
            height: 18,
            border: '3px solid #E07A5F',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'modal-spin 0.9s linear infinite',
          }}
        />
        <span>Laden…</span>
        <style>{`@keyframes modal-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
      </div>
    </div>
  );
}

const SpinnerOverlay = styled.div<{ $fading: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  backdrop-filter: blur(2px);
  transition: opacity 0.4s ease;
  opacity: ${p => p.$fading ? 0 : 1};
`;

const SpinnerCircle = styled.span`
  width: 30px;
  height: 30px;
  border: 4px solid #0b8783;
  border-top-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: page-spin 0.9s linear infinite;
  margin-bottom: 0.75rem;
  @keyframes page-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
`;

const SpinnerLabel = styled.span`
  font-size: 14px;
  color: #0b8783;
  font-weight: 600;
`;

function PageSpinner({ fading }: { fading: boolean }) {
  return (
    <SpinnerOverlay role="status" aria-live="polite" aria-label="Laden..." data-testid="page-spinner" data-fading={fading ? 'true' : 'false'} $fading={fading}>
      <SpinnerCircle aria-hidden="true" />
      <SpinnerLabel>Voorbeelden laden...</SpinnerLabel>
    </SpinnerOverlay>
  );
}

const AdminModal = dynamic(() => import('@/components/AdminModal'), { ssr: false });
const Modal = dynamic(() => import('@/components/Modal'), { ssr: false, loading: () => <ModalFallback /> });
const NewEntryModal = dynamic(() => import('@/components/NewEntryModal'), { ssr: false });

export interface ViewOptions {
  spacing: 'compact' | 'comfortabel';
  layout: 'alternerend' | 'enkelzijdig';
  details: 'volledig' | 'titels';
  animations: boolean;
  theme: string;
}

export default function HomeClient({ artworks: allArtworks, spinnerConfig, testInstantFade }: { artworks: Artwork[]; spinnerConfig?: SpinnerConfig; testInstantFade?: boolean }) {
  const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
  const [editItem, setEditItem] = useState<Artwork | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);

  // Local state for medium and year filtering
  const [selectedMedium, setSelectedMedium] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<number | 'all'>('all');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    spacing: 'comfortabel',
    layout: 'alternerend',
    details: 'volledig',
    animations: true,
    theme: 'default',
  });

  // Page-level spinner dependencies handled via custom hook
  const [hasImages, setHasImages] = useState(false);
  const [potentialImageCount, setPotentialImageCount] = useState(0);

  // Delay image presence computation until timelineItems is defined below
  const [initialImagePresence, setInitialImagePresence] = useState(false);

  // Spinner hook (encapsulates timers and image load threshold logic)
  const { spinnerVisible: pageSpinnerVisible, spinnerFadingOut: pageSpinnerFadingOut, handleCardImageLoaded } = usePageSpinner({
    hasImages,
    potentialImageCount,
    config: spinnerConfig,
    testInstantFade,
  });

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

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allArtworks.filter((artwork: Artwork) => {
      if (!isAdmin && (artwork as any).isHidden) return false;
      const mediumMatch = selectedMedium === 'all' || artwork.medium === selectedMedium;
      const yearMatch = selectedYear === 'all' || artwork.year.toString() === selectedYear;
      const titleText = (artwork.title || '').toString().toLowerCase();
      const descText = (artwork.description || '').toString().toLowerCase();
      const searchMatch = q === '' ? true : titleText.includes(q) || descText.includes(q);
      const evalVal = typeof (artwork as any).evaluationNum === 'number'
        ? (artwork as any).evaluationNum
        : (typeof (artwork as any).evaluation === 'number' ? (artwork as any).evaluation : ((artwork as any).evaluation ? Number((artwork as any).evaluation) : NaN));
      const evaluationMatch = selectedEvaluation === 'all' ? true : (!isNaN(evalVal) && evalVal >= (selectedEvaluation as number));
      const ratingVal = typeof (artwork as any).ratingNum === 'number'
        ? (artwork as any).ratingNum
        : (typeof (artwork as any).rating === 'number' ? (artwork as any).rating : ((artwork as any).rating ? Number((artwork as any).rating) : NaN));
      const ratingMatch = selectedRating === 'all' ? true : (!isNaN(ratingVal) && ratingVal >= (selectedRating as number));
      return mediumMatch && yearMatch && searchMatch && evaluationMatch && ratingMatch;
    });
  }, [allArtworks, isAdmin, selectedMedium, selectedYear, searchTerm, selectedEvaluation, selectedRating]);

  const timelineItems: TimelineItem[] = useMemo(() => {
    const itemsWithYearMarkers: TimelineItem[] = [];
    let lastYear: number | null = null;
    filtered.forEach((artwork: Artwork) => {
      if (artwork.year !== lastYear) {
        itemsWithYearMarkers.push({ id: `year-${artwork.year}`, type: 'year-marker', year: artwork.year });
        lastYear = artwork.year;
      }
      itemsWithYearMarkers.push(artwork);
    });
    return itemsWithYearMarkers;
  }, [filtered]);

  // Compute initial image presence after timelineItems is ready
  useEffect(() => {
    const presenceItems = timelineItems.slice(0, 60).filter(item => (
      'medium' in item && (
        (item as Artwork).coverImageUrl ||
        (Array.isArray((item as Artwork).mediaUrls) && (item as Artwork).mediaUrls!.some(u => /\.(jpe?g|png|gif|webp)$/i.test(u)))
      )
    ));
    const presence = presenceItems.length > 0;
    setInitialImagePresence(presence);
    setHasImages(presence);
    setPotentialImageCount(presenceItems.length);
  }, [timelineItems]);

  const handleEdit = useCallback((artwork: Artwork) => {
    setArtworkToEdit(prev => {
      if (!prev || prev.id !== artwork.id) { return artwork; }
      return prev;
    });
  }, []);

  const handleAdd = () => {
    setArtworkToEdit(null);
    setIsAdminModalOpen(true);
  };

  return (
    <PageLayout>
      <MainContent>
        <MobileNav artworks={allArtworks} />
        <Header
          artworksForCounts={allArtworks}
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
        />
        <CollageContainer>
          {timelineItems.slice(0, visibleCount).map((item: TimelineItem) => {
            if ('type' in item && item.type === 'year-marker') {
              return <YearMarkerCard key={item.id} year={item.year} />;
            }
            const art = item as Artwork;
            return (
              <ArtworkCard
                key={art.id}
                artwork={art}
                onSelect={() => {
                  setSelectedItem(art);
                  if (isAdmin) handleEdit(art);
                }}
                isAdmin={isAdmin}
                onImageLoaded={handleCardImageLoaded}
              />
            );
          })}
        </CollageContainer>
  {pageSpinnerVisible && <PageSpinner fading={pageSpinnerFadingOut} />}
  <Footer onAddNewArtwork={handleAdd} artworks={allArtworks} />
      </MainContent>

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
      <Suspense fallback={<div>Loading admin panel...</div>}>
        {isAdminModalOpen && (
          <AdminModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            artworkToEdit={artworkToEdit}
          />
        )}
      </Suspense>
      <NewEntryModal
        isOpen={showNewEntryModal}
        onClose={() => {
          setShowNewEntryModal(false);
          setEditItem(null);
        }}
        onSave={() => { /* no-op here in client thin layer */ }}
        editItem={editItem}
      />
    </PageLayout>
  );
}
