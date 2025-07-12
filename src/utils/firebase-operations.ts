// src/utils/firebase-operations.ts
import { db } from '@/firebase';
import { ref, push, update, get } from 'firebase/database';
import { ArtworkFormData } from '@/types';

export interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const createArtwork = async (artwork: ArtworkFormData): Promise<OperationResult> => {
  try {
    const artworksRef = ref(db, 'artworks');
    const result = await push(artworksRef, {
      ...artwork,
      createdAt: Date.now(),
      recordLastUpdated: Date.now()
    });
    
    return { success: true, data: { id: result.key } };
  } catch (error) {
    console.error('Failed to create artwork:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const updateArtwork = async (id: string, artwork: Partial<ArtworkFormData>): Promise<OperationResult> => {
  try {
    const artworkRef = ref(db, `artworks/${id}`);
    await update(artworkRef, {
      ...artwork,
      recordLastUpdated: Date.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to update artwork:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Update failed' 
    };
  }
};

export const fetchArtwork = async (id: string): Promise<OperationResult> => {
  try {
    const artworkRef = ref(db, `artworks/${id}`);
    const snapshot = await get(artworkRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: 'Artwork not found' };
    }
  } catch (error) {
    console.error('Failed to fetch artwork:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Fetch failed' 
    };
  }
};