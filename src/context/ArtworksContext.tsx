// ArtworksContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
// 👇 FIX 1: Make sure you import the Realtime Database instance, not Firestore.
// I'm assuming your export is named 'realTimeDB' as we discussed.
import { realtimeDb } from '../firebase'; 
import { ref, onValue } from 'firebase/database';
import { Artwork } from '@/types';

interface ArtworksContextType {
  artworks: Artwork[];
  isLoading: boolean;
  error: string | null; // Changed from optional to required
  refetch: () => void;  // Changed from optional to required
}

const ArtworksContext = createContext<ArtworksContextType>({
  artworks: [],
  isLoading: true,
  error: null,
  refetch: () => {}, // Provide a default empty function
});

export const useArtworks = () => useContext(ArtworksContext);

export const ArtworksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 👇 ADDITION 1: State to trigger a refetch
  const [refetchIndex, setRefetchIndex] = useState(0);
  const refetch = () => setRefetchIndex(prevIndex => prevIndex + 1);

  useEffect(() => {
    // Reset state on each fetch
    setIsLoading(true);
    setError(null);

    // 👇 FIX 2: Use the correct database instance
    const artwallRef = ref(realtimeDb, 'artwall');

    const unsubscribe = onValue(
      artwallRef, 
      (snapshot) => {
        try {
          const data = snapshot.val();
          const loadedArtworks: Artwork[] = [];

          if (data) {
            // This logic processes your nested data structure (medium -> artwork)
            Object.keys(data).forEach(medium => {
              const mediumItems = data[medium];
              if (mediumItems) {
                Object.entries(mediumItems).forEach(([id, value]) => {
                  const item = { id, ...(value as any) };

                  // Ensure a translations object exists
                  if (!item.translations) {
                    item.translations = {};
                  }

                  // Normalize primary language data into the translations object
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
          setArtworks(loadedArtworks);
        } catch (processingError) {
          console.error("Error processing Firebase data:", processingError);
          setError("Failed to process artworks data.");
        } finally {
          setIsLoading(false);
        }
      }, 
      // 👇 ADDITION 2: Official Firebase error handling for the listener
      (firebaseError) => {
        console.error("Firebase read error:", firebaseError);
        setError("Failed to fetch artworks from the database.");
        setIsLoading(false);
      }
    );

    // Cleanup function to detach the listener when the component unmounts
    return () => unsubscribe();
  }, [refetchIndex]); // Effect re-runs when refetch is called

  return (
    <ArtworksContext.Provider value={{ artworks, isLoading, error, refetch }}>
      {children}
    </ArtworksContext.Provider>
  );
};