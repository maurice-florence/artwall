import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Artwork } from '@/types';

interface ArtworksContextType {
  artworks: Artwork[];
  isLoading: boolean;
  error?: string | null;
  refetch?: () => void;
}

const ArtworksContext = createContext<ArtworksContextType>({ artworks: [], isLoading: true });

export const useArtworks = () => useContext(ArtworksContext);

export const ArtworksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const artwallRef = ref(db, 'artwall');
    const unsubscribe = onValue(artwallRef, (snapshot) => {
      const data = snapshot.val();
      const loadedArtworks: Artwork[] = [];
      if (data) {
        Object.keys(data).forEach(medium => {
          const mediumItems = data[medium];
          if (mediumItems) {
            Object.entries(mediumItems).forEach(([id, value]) => {
              const item = { id, ...(value as any) };
              // Ensure translations object exists
              if (!item.translations) {
                item.translations = {};
              }
              // Add primary language to translations if not present
              if (item.language1 && !item.translations[item.language1]) {
                item.translations[item.language1] = {
                  title: item.title,
                  description: item.description,
                  content: item.content || '',
                  lyrics: item.lyrics || ''
                };
              }
              loadedArtworks.push(item as Artwork);
            });
          }
        });
      }
      console.log('Loaded artworks:', loadedArtworks);
      setArtworks(loadedArtworks);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ArtworksContext.Provider value={{ artworks, isLoading }}>{children}</ArtworksContext.Provider>
  );
};
