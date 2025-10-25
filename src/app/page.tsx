"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, realtimeDb } from '@/firebase';
import { ref, onValue, remove, update, push } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { 
    PageLayout, MainContent, CollageContainer, 
    SkeletonCard, NoResultsMessage
} from '@/app/HomePage.styles';
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
// import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ArtworkCard, { CardContainer } from '@/components/ArtworkCard';
import YearMarkerCard from '@/components/YearMarker';
import toast from 'react-hot-toast';
import { Artwork, TimelineItem } from '@/types';
import { MEDIUMS } from '@/constants/medium'; // Correct import, remove unused '@/constants'
// import { useFilterContext } from '@/context/FilterContext';
import { useArtworks } from '@/context/ArtworksContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AdminModal from '@/components/AdminModal';
import NewEntryModal from '@/components/NewEntryModal';

export interface FilterOptions {
    medium: string;
    year: string;
}

export interface ViewOptions {
    spacing: 'compact' | 'comfortabel';
    layout: 'alternerend' | 'enkelzijdig';
    details: 'volledig' | 'titels';
    animations: boolean;
    theme: string;
}

export default function HomePage() {
    const { artworks: allArtworks, isLoading } = useArtworks();
    const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
    const [editItem, setEditItem] = useState<Artwork | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    // const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar removed
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

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
                setVisibleCount(prevCount => prevCount + 100);
            }
        };
    
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
    // Prefer normalized numeric fields produced by ArtworksContext (evaluationNum / ratingNum),
    // fall back to raw fields if normalized versions are absent.
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

    const timelineItems: TimelineItem[] = (() => {
        const itemsWithYearMarkers: TimelineItem[] = [];
        let lastYear: number | null = null;
        sorted.forEach((artwork: Artwork) => {
            if (artwork.year !== lastYear) {
                itemsWithYearMarkers.push({
                    id: `year-${artwork.year}`,
                    type: 'year-marker',
                    year: artwork.year
                });
                lastYear = artwork.year;
            }
            itemsWithYearMarkers.push(artwork);
        });
        return itemsWithYearMarkers;
    })();

    const handleSaveNewEntry = async (entry: any) => {
        if (entry && entry._delete && entry.id && entry.medium) {
            await remove(ref(realtimeDb, `artwall/${entry.medium}/${entry.id}`));
            setSelectedItem(null);
            return;
        }
        const medium = entry.medium || 'other';
        const newEntry = {
            ...entry,
            year: Number(entry.year) || new Date().getFullYear(),
            month: Number(entry.month) || 1,
            day: Number(entry.day) || 1,
            createdAt: Date.now(),
            isHidden: false,
        };
        // Generate a new key for the artwork
        const artwallRef = ref(realtimeDb, `artwall/${medium}`);
        const pushRef = push(artwallRef);
        const newId = pushRef.key;
        await update(ref(realtimeDb, `artwall/${medium}/${newId}`), { ...newEntry, id: newId });
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

    // Dev-only debug: log how many artworks match the selected evaluation/rating when filters change
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;
        const evalCount = allArtworks.reduce((acc, a) => {
            const val = (a as any).evaluationNum ?? ((a as any).evaluation);
            const n = typeof val === 'number' ? val : (val && val !== '' ? Number(val) : NaN);
            if (!isNaN(n) && selectedEvaluation !== 'all' && n >= (selectedEvaluation as number)) return acc + 1;
            return acc;
        }, 0);
        const ratingCount = allArtworks.reduce((acc, a) => {
            const val = (a as any).ratingNum ?? ((a as any).rating);
            const n = typeof val === 'number' ? val : (val && val !== '' ? Number(val) : NaN);
            if (!isNaN(n) && selectedRating !== 'all' && n >= (selectedRating as number)) return acc + 1;
            return acc;
        }, 0);
        console.debug(`[debug] evaluation filter=${selectedEvaluation} -> ${evalCount} matching artworks (total ${allArtworks.length})`);
        console.debug(`[debug] rating filter=${selectedRating} -> ${ratingCount} matching artworks (total ${allArtworks.length})`);
        // Also expose on window for header badge in dev
        try {
            (window as any).__dev_eval_count__ = evalCount;
            (window as any).__dev_rating_count__ = ratingCount;
            (window as any).__dev_total__ = allArtworks.length;
        } catch (e) {
            // ignore (SSR, etc.)
        }
    }, [selectedEvaluation, selectedRating, allArtworks]);

    function isArtwork(item: TimelineItem): item is Artwork {
        return (item as Artwork).medium !== undefined;
    }

    if (isLoading || allArtworks.length === 0) {
        return (
            <PageLayout />
        );
    }

    return (
        <PageLayout>
            {/* Sidebar removed */}
            <MainContent>
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
            />
                <CollageContainer>
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
                </CollageContainer>
                <Footer onAddNewArtwork={handleAdd} />
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
            <ErrorBoundary>
              <Suspense fallback={<div>Loading admin panel...</div>}>
                {isAdminModalOpen && (
                  <AdminModal 
                      isOpen={isAdminModalOpen}
                      onClose={() => setIsAdminModalOpen(false)}
                      artworkToEdit={artworkToEdit}
                  />
                )}
              </Suspense>
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
