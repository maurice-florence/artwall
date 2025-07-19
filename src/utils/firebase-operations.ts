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
    // Place artwork in artwall/{medium}/{id}
    const medium = artwork.medium || 'other';
    const artwallRef = ref(db, `artwall/${medium}`);
    const pushRef = push(artwallRef);
    const newId = pushRef.key;
    await update(ref(db, `artwall/${medium}/${newId}`), {
      ...artwork,
      id: newId,
      createdAt: Date.now(),
      recordLastUpdated: Date.now()
    });
    return { success: true, data: { id: newId } };
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
    // Find and update artwork in any medium folder
    const artwallRef = ref(db, 'artwall');
    const snapshot = await get(artwallRef);
    const data = snapshot.val();
    let foundRef = null;
    if (data) {
      for (const medium of Object.keys(data)) {
        if (data[medium] && data[medium][id]) {
          foundRef = ref(db, `artwall/${medium}/${id}`);
          break;
        }
      }
    }
    if (!foundRef) throw new Error('Artwork not found');
    await update(foundRef, {
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
    // Find artwork in any medium folder
    const artwallRef = ref(db, 'artwall');
    const snapshot = await get(artwallRef);
    const data = snapshot.val();
    let found = null;
    if (data) {
      for (const medium of Object.keys(data)) {
        if (data[medium] && data[medium][id]) {
          found = data[medium][id];
          break;
        }
      }
    }
    if (found) {
      return { success: true, data: found };
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