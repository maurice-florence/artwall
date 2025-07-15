"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/firebase';
import { ref, onValue, remove, update, push } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { 
    PageLayout, MainContent, CollageContainer, 
    SkeletonCard, NoResultsMessage
} from '@/app/HomePage.styles';
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ArtworkCard, { CardContainer } from '@/components/ArtworkCard';
import YearMarkerCard from '@/components/YearMarker';
import toast from 'react-hot-toast';
import { Artwork, TimelineItem } from '@/types';
import { CATEGORIES } from '@/constants';
import { useFilterContext } from '@/context/FilterContext';
import { useArtworks } from '@/context/ArtworksContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AdminModal from '@/components/AdminModal';
import NewEntryModal from '@/components/NewEntryModal';

export interface FilterOptions {
    category: string;
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
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [showNewEntryModal, setShowNewEntryModal] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [artworkToEdit, setArtworkToEdit] = useState<Artwork | null>(null);
    
    const { filters, setFilters, searchTerm, setSearchTerm } = useFilterContext();
    const [viewOptions, setViewOptions] = useState<ViewOptions>({
        spacing: 'comfortabel', layout: 'alternerend',
        details: 'volledig', animations: true, theme: 'atelier'
    });

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => setIsAdmin(!!user));
    }, []);

    const availableCategories = useMemo(() => {
        const cats = new Set(allArtworks.map(a => a.category));
        return Array.from(cats).filter(cat => typeof cat === 'string');
    }, [allArtworks]);

    const handleCategoryToggle = (cat: string) => {
        setFilters(prev => ({ ...prev, category: prev.category === cat ? 'all' : cat }));
    };

    const timelineItems = useMemo(() => {
        const filtered = allArtworks.filter(artwork => {
            if (!isAdmin && artwork.isHidden) return false;
            const categoryMatch = filters.category === 'all' || artwork.category === filters.category;
            const yearMatch = filters.year === 'all' || artwork.year.toString() === filters.year;
            const searchMatch = searchTerm.trim() === '' ? true : 
                artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                artwork.description.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && yearMatch && searchMatch;
        });

        const sorted = filtered.sort((a, b) => {
            const dateA = new Date(a.year, (a.month || 1) - 1, a.day || 1).getTime();
            const dateB = new Date(b.year, (b.month || 1) - 1, b.day || 1).getTime();
            return dateB - dateA;
        });

        const itemsWithYearMarkers: TimelineItem[] = [];
        let lastYear: number | null = null;

        sorted.forEach(artwork => {
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
    }, [allArtworks, filters, isAdmin, searchTerm]);

    const handleSaveNewEntry = async (entry: any) => {
        if (entry && entry._delete && entry.id) {
            await remove(ref(db, `artworks/${entry.id}`));
            setSelectedItem(null);
            return;
        }
        const newEntry = {
            ...entry,
            year: Number(entry.year) || new Date().getFullYear(),
            month: Number(entry.month) || 1,
            day: Number(entry.day) || 1,
            createdAt: Date.now(),
            isHidden: false,
        };
        await push(ref(db, 'artworks'), newEntry);
    };

    const handleEdit = useCallback((artwork: Artwork) => {
        setArtworkToEdit(prev => {
            if (!prev || prev.id !== artwork.id) {
                return artwork;
            }
            return prev;
        });
        setIsAdminModalOpen(true);
    }, []);
    const handleAdd = () => {
        setArtworkToEdit(null);
        setIsAdminModalOpen(true);
    };

    function isArtwork(item: TimelineItem): item is Artwork {
        return (item as Artwork).category !== undefined;
    }

    if (isLoading || allArtworks.length === 0) {
        return (
            <PageLayout>
            </PageLayout>
        );
    }
    
    return (
        <PageLayout>
            <Sidebar 
                isOpen={isSidebarOpen} 
                allArtworks={allArtworks}
            />
            <MainContent $isSidebarOpen={isSidebarOpen}>
                <Header 
                  onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                  selectedCategories={filters.category !== 'all' ? [filters.category] : []}
                  onCategoryToggle={handleCategoryToggle}
                  availableCategories={availableCategories}
                />
                <CollageContainer>
                    <CardContainer category="poetry" onClick={handleAdd} style={{ border: '2px dashed #E07A5F', background: '#fff', color: '#E07A5F', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }} title="Voeg een nieuwe kaart toe" key="plus-card">
                        +
                    </CardContainer>
                    {timelineItems.map(item => {
                        if ('type' in item && item.type === 'year-marker') {
                            return <YearMarkerCard key={item.id} year={item.year} />;
                        }
                        if (isArtwork(item)) {
                            return <ArtworkCard key={item.id} artwork={item} onSelect={() => {
                                setSelectedItem(item);
                                if (isAdmin) handleEdit(item);
                            }} isAdmin={isAdmin} />;
                        }
                        return null;
                    })}
                </CollageContainer>
                <Footer />
            </MainContent>

            {selectedItem && (
                <Modal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    isAdmin={isAdmin}
                    onEdit={(item) => {
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
};


