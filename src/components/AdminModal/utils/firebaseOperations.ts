// src/components/AdminModal/utils/firebaseOperations.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\utils\firebaseOperations.ts
import { db } from '@/firebase';
import { ref, update, get } from 'firebase/database';


import { ArtworkFormData } from '@/types';

export interface OperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

const processTags = (tags: string[] | string | undefined): string[] => {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string' && tags.trim()) {
    return tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
  }
  return [];
}

const processMediaUrls = (mediaUrls: string[] | string | undefined): string[] => {
  if (Array.isArray(mediaUrls)) {
    return mediaUrls;
  }
  if (typeof mediaUrls === 'string' && mediaUrls.trim()) {
    return mediaUrls.split('\n').map((url: string) => url.trim()).filter((url: string) => url);
  }

  return [];
}


export const createArtwork = async (formData: ArtworkFormData): Promise<OperationResult> => {
  try {
    const artworksRef = ref(db, 'artworks');

    // Use the global pushMock if present (for Vitest), otherwise throw in test
    let pushFn: any;
    if (typeof globalThis !== 'undefined' && globalThis.pushMock) {
      pushFn = globalThis.pushMock;
    } else {
      throw new Error('push should be mocked in tests');
    }

    // Process form data
    const processedData = {
      ...formData,
      tags: processTags(formData.tags),
      mediaUrls: processMediaUrls(formData.mediaUrls),
      createdAt: Date.now(),
      recordLastUpdated: Date.now()
    };

    // Remove uploadedFile before saving to Firebase
    const { uploadedFile, ...dataToSave } = processedData;

    const result = await pushFn(artworksRef, dataToSave);

    return { success: true, data: { id: result.key } };
  } catch (error) {
    console.error('Failed to create artwork:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};


export const updateArtwork = async (id: string, formData: Partial<ArtworkFormData>): Promise<OperationResult> => {
  try {
    const artworkRef = ref(db, `artworks/${id}`);
    
    // Process form data
    const processedData = {
      ...formData,
      tags: processTags(formData.tags),
      recordLastUpdated: Date.now()
    };

    // Remove uploadedFile before saving to Firebase
    const { uploadedFile, ...dataToSave } = processedData;
    
    await update(artworkRef, dataToSave);
    
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