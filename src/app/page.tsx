"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
    PageLayout, MainContent, CollageContainer, SkeletonCard, NoResultsMessage
} from '@/app/HomePage.styles';
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ArtworkCard from '@/components/ArtworkCard';
import YearMarkerCard from '../components/YearMarker';
import { Artwork, TimelineItem } from '@/types';

export type ViewOptions = {
    spacing: 'compact' | 'comfortabel';
    layout: 'alternerend' | 'enkelzijdig';
    details: 'titels' | 'volledig';
    animations: boolean;
    theme: string;
};

export interface FilterOptions {
    category: string;
    year: string;
}

export default function HomePage() {
    const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
    const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar standaard ingeklapt
    
    const [filters, setFilters] = useState<FilterOptions>({ category: 'all', year: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewOptions, setViewOptions] = useState<ViewOptions>({
        spacing: 'compact',
        layout: 'alternerend',
        details: 'volledig',
        animations: true,
        theme: 'atelier',
    });
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => setIsAdmin(!!user));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const artworksRef = ref(db, 'artworks');
        onValue(artworksRef, (snapshot) => {
            const data = snapshot.val();
            const loadedArtworks: Artwork[] = data ? Object.entries(data).map(([id, value]) => ({ id, type: 'artwork', ...(value as Omit<Artwork, 'id' | 'type'>) })) : [];
            setAllArtworks(loadedArtworks);
        });
    }, []);

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
            return dateB - dateA; // Sorteer van nieuw naar oud
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

    if (allArtworks.length === 0) {
        return (
            <div style={{ padding: '2rem' }}><SkeletonCard /><SkeletonCard /></div>
        );
    }

    return (
        <PageLayout>
            <Sidebar 
                isOpen={isSidebarOpen} 
                allArtworks={allArtworks}
                filters={filters}
                setFilters={setFilters}
                viewOptions={viewOptions}
                setViewOptions={setViewOptions}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <MainContent $isSidebarOpen={isSidebarOpen}>
                <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                {timelineItems.length > 0 ? (
                    <CollageContainer>
                        {timelineItems.map(item => {
                            if (item.type === 'year-marker') {
                                return <YearMarkerCard key={item.id} year={item.year} />;
                            }
                            // TypeScript weet nu dat 'item' een Artwork is
                            return <ArtworkCard key={item.id} artwork={item} onSelect={() => setSelectedItem(item)} />;
                        })}
                    </CollageContainer>
                ) : (
                    <NoResultsMessage>
                        <p>Geen kunstwerken gevonden die aan uw criteria voldoen.</p>
                        <p>Probeer een ander filter of reset de filters.</p>
                    </NoResultsMessage>
                )}
                <Footer />
            </MainContent>

            {selectedItem && (
                <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </PageLayout>
    );
};
