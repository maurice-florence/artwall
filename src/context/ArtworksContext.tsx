import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Artwork, PoetryArtwork, ProseArtwork, VisualArtArtwork, MusicArtwork, VideoArtwork, OtherArtwork } from '@/types';

interface ArtworksContextType {
  artworks: Artwork[];
  isLoading: boolean;
}

const ArtworksContext = createContext<ArtworksContextType>({ artworks: [], isLoading: true });

export const useArtworks = () => useContext(ArtworksContext);

export const ArtworksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const artworksRef = ref(db, 'artworks');
    const unsubscribe = onValue(artworksRef, (snapshot) => {
      const data = snapshot.val();
      const loadedArtworks: Artwork[] = data
        ? Object.entries(data).map(([id, value]) => {
            const item = { id, ...(value as any) };
            // Type assertion: ensure correct type for each category
            switch (item.category) {
              case 'poetry':
              case 'prosepoetry':
                return item as PoetryArtwork;
              case 'prose':
                return item as ProseArtwork;
              case 'sculpture':
              case 'drawing':
              case 'image':
                return item as VisualArtArtwork;
              case 'music':
                return item as MusicArtwork;
              case 'video':
                return item as VideoArtwork;
              case 'other':
                return item as OtherArtwork;
              default:
                return item as Artwork;
            }
          })
        : [];
      setArtworks(loadedArtworks);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ArtworksContext.Provider value={{ artworks, isLoading }}>{children}</ArtworksContext.Provider>
  );
};
