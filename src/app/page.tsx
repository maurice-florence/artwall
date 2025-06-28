"use client";

import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, deleteObject } from "firebase/storage";
import {
    PageLayout, MainContent, TimelineContainer,
    YearHeader, TimelineItemWrapper, ItemHeader, ItemCategory, NoResultsMessage, TimelineYearGroup
} from '@/app/HomePage.styles';
import { FaPenNib, FaPaintBrush, FaMusic, FaEdit, FaTrash, FaEye, FaEyeSlash, FaBookOpen } from 'react-icons/fa';
import Modal from '@/components/Modal';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import toast from 'react-hot-toast';
import { Artwork } from '@/types';
import { ThemeContext } from '@/context/ThemeContext';

export interface FilterOptions {
    category: string;
    year: string;
}

// Gebruik de juiste string literals voor ViewOptions
type ViewOptionsType = {
  spacing: 'compact' | 'comfortabel';
  layout: 'alternerend' | 'enkelzijdig';
  details: 'volledig' | 'titels';
  animations: boolean;
  theme: string;
};

const iconMap: { [key: string]: React.ReactElement } = {
  poëzie: <FaPenNib />,
  proza: <FaBookOpen />,
  sculptuur: <FaPaintBrush />,
  tekening: <FaPaintBrush />,
  muziek: <FaMusic />,
};

export default function HomePage() {
    const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
    const [selectedItem, setSelectedItem] = useState<Artwork | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    
    // Altijd vaste opties voor weergave
    const filters: FilterOptions = { category: 'all', year: 'all' };
    const viewOptions: ViewOptionsType = useMemo(() => ({
        spacing: 'compact',
        layout: 'alternerend',
        details: 'volledig',
        animations: true,
        theme: 'atelier',
    }), []);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => setIsAdmin(!!user));
    }, []);

    useEffect(() => {
        const artworksRef = ref(db, 'artworks');
        onValue(artworksRef, (snapshot) => {
            const data = snapshot.val();
            const loadedArtworks: Artwork[] = data ? Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Artwork, 'id'>) })) : [];
            setAllArtworks(loadedArtworks);
        });
    }, []);

    const handleToggleHide = useCallback(async (artwork: Artwork) => {
        const artworkRef = ref(db, 'artworks/' + artwork.id);
        await update(artworkRef, { isHidden: !artwork.isHidden });
        toast.success(`Item is nu ${artwork.isHidden ? 'zichtbaar' : 'verborgen'}.`);
    }, []);

    const handleDelete = useCallback(async (artwork: Artwork) => {
        if (typeof window !== 'undefined' && window.confirm(`Weet je zeker dat je "${artwork.title}" permanent wilt verwijderen?`)) {
            try {
                await remove(ref(db, 'artworks/' + artwork.id));
                const storage = getStorage();
                if (artwork.mediaUrl) {
                    const fileRef = storageRef(storage, artwork.mediaUrl);
                    await deleteObject(fileRef);
                }
                if (artwork.coverImageUrl) {
                    const coverRef = storageRef(storage, artwork.coverImageUrl);
                    await deleteObject(coverRef);
                }
                toast.success('Kunstwerk en bestanden verwijderd.');
            } catch (error: any) {
                 if (error.code !== 'storage/object-not-found') {
                     toast.error("Fout bij verwijderen: " + error.message);
                } else {
                     toast.success('Database entry verwijderd (bestand was al weg).');
                }
            }
        }
    }, []);

    const handleEdit = useCallback((artwork: Artwork) => {
        router.push(`/admin?edit=${artwork.id}`);
    }, [router]);

    const groupedAndFilteredArtworks = useMemo(() => {
        const startYear = 1987;
        const currentYear = new Date().getFullYear();
        const initialGroups: { [key: number]: Artwork[] } = {};
        for (let year = currentYear; year >= startYear; year--) {
            initialGroups[year] = [];
        }

        const filtered = allArtworks.filter(artwork => {
            if (!isAdmin && artwork.isHidden) return false;
            const categoryMatch = filters.category === 'all' || artwork.category === filters.category;
            const yearMatch = filters.year === 'all' || artwork.year.toString() === filters.year;
            const searchMatch = searchTerm.trim() === '' ? true : 
                artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                artwork.description.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && yearMatch && searchMatch;
        });

        const grouped = filtered.reduce((acc, artwork) => {
            if (acc[artwork.year]) {
                acc[artwork.year].push(artwork);
            }
            return acc;
        }, initialGroups);
        
        for (const year in grouped) {
            grouped[year].sort((a, b) => {
                const dateA = new Date(a.year, (a.month || 1) - 1, a.day || 1).getTime();
                const dateB = new Date(b.year, (b.month || 1) - 1, b.day || 1).getTime();
                return dateA - dateB;
            });
        }
        return grouped;
    }, [allArtworks, filters, isAdmin, searchTerm]);

    const sortedYears = Object.keys(groupedAndFilteredArtworks).sort((a, b) => Number(b) - Number(a));
    const nonEmptyYearsCount = useMemo(() => Object.values(groupedAndFilteredArtworks).filter(arr => arr.length > 0).length, [groupedAndFilteredArtworks]);
    
    const formattedDate = (artwork: Artwork) => new Date(artwork.year, (artwork.month || 1) - 1, artwork.day || 1)
                                .toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <PageLayout>
            <Sidebar 
                isOpen={isSidebarOpen} 
                allArtworks={allArtworks}
                filters={filters}
                setFilters={() => {}} // niet meer aanpasbaar
                viewOptions={viewOptions}
                setViewOptions={() => {}} // niet meer aanpasbaar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <MainContent $isSidebarOpen={isSidebarOpen}>
                <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                {allArtworks.length === 0 ? (
                    <div style={{ padding: '2rem' }}>Laden...</div>
                ) : (
                    <TimelineContainer>
                        {nonEmptyYearsCount === 0 && (
                            <NoResultsMessage>
                                <p>Geen kunstwerken gevonden die aan uw criteria voldoen.</p>
                                <p>Probeer een ander filter of reset de filters.</p>
                            </NoResultsMessage>
                        )}
                        {sortedYears.map((year, yearIdx) => {
                          const artworks = groupedAndFilteredArtworks[Number(year)];
                          if (artworks.length === 0 && filters.year === 'all') {
                            return (
                              <TimelineYearGroup key={year}>
                                <YearHeader $empty>{year}</YearHeader>
                              </TimelineYearGroup>
                            );
                          }
                          if (artworks.length === 0) return null;

                          return (
                            <TimelineYearGroup key={year}>
                              <YearHeader>{year}</YearHeader>
                              {artworks.map((artwork, index) => {
                                const isHiddenForVisitor = !isAdmin && artwork.isHidden;
                                const side = (index % 2 === 0) ? 'left' : 'right';
                                return (
                                  <TimelineItemWrapper
                                    key={artwork.id}
                                    className={artwork.isHidden ? 'hidden' : ''}
                                    $side={side}
                                    onClick={() => !isHiddenForVisitor && setSelectedItem(artwork)}
                                  >
                                    {isAdmin && (
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <span onClick={(e) => { e.stopPropagation(); handleToggleHide(artwork); }} title={artwork.isHidden ? "Zichtbaar maken" : "Verbergen"}>
                                          {artwork.isHidden ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                        <span onClick={(e) => { e.stopPropagation(); handleEdit(artwork); }} title="Bewerken"><FaEdit /></span>
                                        <span onClick={(e) => { e.stopPropagation(); handleDelete(artwork); }} title="Verwijderen"><FaTrash /></span>
                                      </div>
                                    )}
                                    <ItemHeader $details={viewOptions.details}>
                                      <h2>{artwork.title}</h2>
                                      <ItemCategory>
                                        {iconMap[artwork.category] || <FaPenNib />}
                                        {viewOptions.details === 'volledig' && <span>{artwork.category}</span>}
                                      </ItemCategory>
                                    </ItemHeader>
                                    {viewOptions.details === 'volledig' && <>
                                      <p><strong>Datum:</strong> {formattedDate(artwork)}</p>
                                      <p>{artwork.description}</p>
                                    </>}
                                  </TimelineItemWrapper>
                                );
                              })}
                            </TimelineYearGroup>
                          );
                        })}
                    </TimelineContainer>
                )}
                <Footer />
            </MainContent>

            {selectedItem && (
                <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </PageLayout>
    );
}
