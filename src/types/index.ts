// De mogelijke categorieën, nu als een expliciet type
export type ArtworkCategory = 'poetry' | 'prose' | 'sculpture' | 'drawing' | 'music' | 'video' | 'prosepoetry' | 'image' | 'other';

// De basis-interface met alle gedeelde eigenschappen
interface BaseArtwork {
  id: string;
  title: string;
  // De creatiedatum van het KUNSTWERK zelf
  year: number;
  month: number;
  day: number;
  description: string;
  isHidden?: boolean;
  
  // Nieuwe velden voor organisatie en tracking
  category: string;
  version?: string;
  language?: string;
  language1?: string;
  language2?: string;
  language3?: string;
  location1?: string;
  location2?: string;
  tags?: string[];
  url1?: string;
  url2?: string;
  url3?: string;
  content?: string;
  
  // Media fields
  mediaUrl?: string;
  mediaUrls?: string[];
  coverImageUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  
  // Timestamps
  recordCreationDate: number;
  recordLastUpdated?: number;
  createdAt?: number; // For backwards compatibility
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
