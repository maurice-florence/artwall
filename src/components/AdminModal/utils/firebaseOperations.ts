// src/components/AdminModal/utils/firebaseOperations.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\utils\firebaseOperations.ts
import { ref as dbRef, update, set } from 'firebase/database';
import { db } from '@/firebase';
import { Artwork } from '@/types';
import { ArtworkFormData } from '../types';

export interface SaveResult {
  success: boolean;
  error?: string;
}

export const saveArtwork = async (
  formData: ArtworkFormData,
  artworkToEdit?: Artwork | null
): Promise<SaveResult> => {
  try {
    const artworkData = prepareArtworkData(formData, artworkToEdit);
    
    if (artworkToEdit && 'id' in artworkToEdit) {
      // Update existing artwork
      await update(dbRef(db, `artworks/${artworkToEdit.id}`), artworkData);
    } else {
      // Create new artwork
      const newKey = generateArtworkKey(formData);
      artworkData.id = newKey;
      await set(dbRef(db, `artworks/${newKey}`), artworkData);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Save artwork error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

const prepareArtworkData = (formData: ArtworkFormData, artworkToEdit?: Artwork | null) => {
  const artworkData: any = {
    title: formData.title.trim(),
    year: formData.year,
    month: formData.month,
    day: formData.day,
    category: formData.category,
    description: formData.description.trim(),
    isHidden: formData.isHidden,
    
    version: formData.version.trim(),
    language: formData.language,
    language1: formData.language1.trim(),
    language2: formData.language2.trim(),
    language3: formData.language3.trim(),
    location1: formData.location1.trim(),
    location2: formData.location2.trim(),
    url1: formData.url1.trim(),
    url2: formData.url2.trim(),
    url3: formData.url3.trim(),
    
    tags: formData.tags.trim() 
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
      : [],
    
    content: formData.content.trim(),
    lyrics: formData.lyrics.trim(),
    chords: formData.chords.trim(),
    soundcloudEmbedUrl: formData.soundcloudEmbedUrl.trim(),
    soundcloudTrackUrl: formData.soundcloudTrackUrl.trim(),
    mediaType: formData.mediaType,
    coverImageUrl: formData.coverImageUrl.trim(),
    audioUrl: formData.audioUrl.trim(),
    pdfUrl: formData.pdfUrl.trim(),
    mediaUrl: formData.mediaUrl.trim(),
    
    mediaUrls: formData.mediaUrls.trim() 
      ? formData.mediaUrls.split('\n').map(url => url.trim()).filter(url => url) 
      : [],
    
    recordCreationDate: artworkToEdit && 'recordCreationDate' in artworkToEdit 
      ? artworkToEdit.recordCreationDate 
      : Date.now(),
    recordLastUpdated: Date.now(),
  };

  // Remove empty values
  Object.keys(artworkData).forEach(key => {
    if (artworkData[key] === '' || (Array.isArray(artworkData[key]) && artworkData[key].length === 0)) {
      delete artworkData[key];
    }
  });

  return artworkData;
};

const generateArtworkKey = (formData: ArtworkFormData): string => {
  const safeMonth = (formData.month || new Date().getMonth() + 1).toString().padStart(2, '0');
  const safeDay = (formData.day || new Date().getDate()).toString().padStart(2, '0');
  const safeYear = formData.year || new Date().getFullYear();
  
  return `${safeYear}${safeMonth}${safeDay}_${formData.category}_${formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}_${formData.language}`;
};