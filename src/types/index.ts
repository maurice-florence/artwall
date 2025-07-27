// Validation errors for forms
export interface ValidationErrors {
  [key: string]: string;
}
// Use centralized types from src/constants/medium.ts
import { ArtworkMedium, ArtworkSubtype } from '@/constants/medium';
export type { ArtworkMedium, ArtworkSubtype };

// De basis-interface met alle gedeelde eigenschappen
interface BaseArtwork {
  id: string;
  title: string; // Primary language title
  // De creatiedatum van het KUNSTWERK zelf
  year: number;
  month: number;
  day: number;
  description: string; // Primary language description
  
  // NEW: Updated to use medium/subtype structure
  medium: ArtworkMedium;
  subtype: ArtworkSubtype;
  
  isHidden?: boolean;
  
  // Language support
  language1: string; // Primary language code
  language2?: string; // Secondary language code
  language3?: string; // Tertiary language code
  
  // Translations object
  translations: {
    [languageCode: string]: ArtworkTranslation;
  };
  
  // Nieuwe velden voor organisatie en tracking
  version?: string;
  location1?: string;
  location2?: string;
  tags?: string[];
  url1?: string;
  url2?: string;
  url3?: string;
  content?: string; // Primary language content
  
  // NEW: Evaluation and rating fields
  evaluation?: string; // Personal assessment (1-5)
  rating?: string; // Audience or public rating
  
  // Category-specific media fields
  coverImageUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  mediaType?: string; // Optional mediaType for compatibility
  
  // Music-specific fields
  lyrics?: string; // Primary language lyrics
  chords?: string;
  soundcloudEmbedUrl?: string;
  soundcloudTrackUrl?: string;
  
  // Timestamps
  recordCreationDate: number;
  recordLastUpdated?: number;
}

// Unified Artwork type
export interface Artwork extends BaseArtwork {}

// Jaartal-marker voor de collage
export interface YearMarker {
    id: string;
    type: 'year-marker';
    year: number;
}

export type TimelineItem = Artwork | YearMarker;

// Vertalingen interface
export interface ArtworkTranslation {
  title: string;
  description: string;
  content?: string;
  lyrics?: string;
}

// Formulier gegevens interface
export interface ArtworkFormData {
  title: string;
  year: number;
  month?: number;
  day?: number;
  
  // NEW: Medium-based structure
  medium: ArtworkMedium;
  subtype: ArtworkSubtype;
  
  description?: string;
  content?: string;
  isHidden?: boolean;
  version?: string;
  
  // Language fields
  language1: string;
  language2?: string;
  language3?: string;
  
  // Location fields
  location1?: string;
  location2?: string;
  
  // Tags (comma-separated string that gets converted to array)
  tags?: string[];
  
  // URL fields
  url1?: string;
  url2?: string;
  url3?: string;
  
  // NEW: Evaluation and rating fields
  evaluation?: string; // Personal assessment (1-5)
  rating?: string; // Audience or public rating
  
  // Music specific
  lyrics?: string;
  chords?: string;
  soundcloudEmbedUrl?: string;
  soundcloudTrackUrl?: string;
  
  // Media URLs
  mediaUrl?: string;
  coverImageUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  mediaType?: string;  // Keep for backwards compatibility
  
  // Additional fields
  mediaUrls?: string[];
  
  // For file uploads
  uploadedFile?: File;
  
  // Test fields for Phase 3B demo
  testColor?: string;
  testMultiSelect?: string[];
  testRichText?: string;
  testUrl?: string;
  testFile?: File | FileList | null;
  testDate?: { year?: number; month?: number; day?: number };
}
