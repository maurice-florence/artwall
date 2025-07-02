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
    tags?: string[];
    collectionId?: string;
    recordCreationDate: number; // Timestamp van wanneer de *database entry* is gemaakt
    recordLastUpdated?: number; // Timestamp van de laatste update
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
