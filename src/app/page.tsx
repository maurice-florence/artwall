"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { ref, onValue, remove, update, push } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import { 
    PageLayout, MainContent, CollageContainer, 
    SkeletonCard, NoResultsMessage
} from '@/app/HomePage.styles'; // Haal page.module.css hier weg
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ArtworkCard from '@/components/ArtworkCard';
import YearMarkerCard from '@/components/YearMarker';
import toast from 'react-hot-toast';
import { Artwork, TimelineItem } from '@/types';
import { CATEGORIES } from '@/constants';
import NewEntryModal from '@/components/NewEntryModal';
import { useFilterContext } from '@/context/FilterContext';
import { useArtworks } from '@/context/ArtworksContext';

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
    
    const { filters, setFilters, searchTerm, setSearchTerm } = useFilterContext();
    const [viewOptions, setViewOptions] = useState<ViewOptions>({
        spacing: 'comfortabel', layout: 'alternerend',
        details: 'volledig', animations: true, theme: 'atelier'
    });
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => setIsAdmin(!!user));
    }, []);

    // Link header category filter to sidebar filter
    const handleCategoryToggle = (cat: string) => {
        setFilters(prev => ({ ...prev, category: prev.category === cat ? 'all' : cat }));
    };

    // Use filters.category for filtering
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

    // Add new entry to database or delete if _delete is set
    const handleSaveNewEntry = async (entry: any) => {
        if (entry && entry._delete && entry.id) {
            // Remove from Firebase only (context will update automatically)
            await remove(ref(db, `artworks/${entry.id}`));
            setSelectedItem(null); // Close modal after delete
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
                  selectedCategories={[]}
                  onCategoryToggle={() => {}}
                />
                <CollageContainer>
                    {/* Plus card at the top left */}
                    <div
                        style={{
                            width: 180, height: 180, minWidth: 180, minHeight: 180,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed #E07A5F', borderRadius: 12, cursor: 'pointer',
                            fontSize: 64, color: '#E07A5F', margin: 8, background: '#fff',
                        }}
                        onClick={() => setShowNewEntryModal(true)}
                        title="Voeg een nieuwe kaart toe"
                        key="plus-card"
                    >
                        +
                    </div>
                    {/* Timeline items */}
                    {timelineItems.map(item => {
                        if (item.type === 'year-marker') {
                            return <YearMarkerCard key={item.id} year={item.year} />;
                        }
                        // Use artwork.id as key, which is always unique
                        return <ArtworkCard key={item.id} artwork={item} onSelect={() => setSelectedItem(item)} isAdmin={isAdmin} />;
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
                />
            )}
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
