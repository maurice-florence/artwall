// De mogelijke categorieën, nu als een expliciet type
export type ArtworkCategory = 'poetry' | 'prose' | 'sculpture' | 'drawing' | 'music' | 'video' | 'prosepoetry' | 'image' | 'other';

// De basis-interface met alle gedeelde eigenschappen
interface BaseArtwork {
  id: string;
  title: string; // Primary language title
  // De creatiedatum van het KUNSTWERK zelf
  year: number;
  month: number;
  day: number;
  description: string; // Primary language description
  category: string;
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
  
  // Category-specific media fields
  coverImageUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  mediaUrl?: string;
  mediaUrls?: string[];
  
  // Music-specific fields
  lyrics?: string; // Primary language lyrics
  chords?: string;
  soundcloudEmbedUrl?: string;
  soundcloudTrackUrl?: string;
  
  // Timestamps
  recordCreationDate: number;
  recordLastUpdated?: number;
}

// Specifieke interfaces per categorie
export interface PoetryArtwork extends BaseArtwork {
    category: 'poetry' | 'prosepoetry';
    mediaType: 'text';
    content: string;
}

export interface ProseArtwork extends BaseArtwork {
    category: 'prose';
    mediaUrl: string; // Link to PDF
    coverImageUrl: string;
}

export interface VisualArtArtwork extends BaseArtwork {
    category: 'sculpture' | 'drawing' | 'image';
    mediaType: 'image';
    mediaUrl: string;
}

export interface MusicArtwork extends BaseArtwork {
    category: 'music';
    mediaType: 'audio';
    mediaUrl?: string;
    soundcloudEmbedUrl?: string;
    soundcloudTrackUrl?: string;
    lyrics?: string;
    chords?: string;
}

export interface VideoArtwork extends BaseArtwork {
    category: 'video';
    mediaType: 'video';
    mediaUrl: string;
}

export interface OtherArtwork extends BaseArtwork {
    category: 'other';
    content?: string;
    mediaUrl?: string;
}

// De uiteindelijke "union" type
export type Artwork = 
    | PoetryArtwork 
    | ProseArtwork 
    | VisualArtArtwork 
    | MusicArtwork 
    | VideoArtwork
    | OtherArtwork;

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
