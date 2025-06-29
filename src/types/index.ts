export type ArtworkCategory = 'poëzie' | 'proza' | 'sculptuur' | 'tekening' | 'muziek';

export interface Artwork {
    id: string;
    type: 'artwork'; // Duidelijk type voor de union
    title: string;
    year: number;
    month: number;
    day: number;
    category: ArtworkCategory;
    description: string;
    mediaType?: 'text' | 'image' | 'audio';
    mediaUrl?: string;
    coverImageUrl?: string;
    soundcloudEmbedUrl?: string;
    soundcloudTrackUrl?: string;
    content?: string;
    lyrics?: string;
    chords?: string;
    isHidden?: boolean;
}

export interface YearMarker {
    id: string; // Gebruik het jaar als unieke ID
    type: 'year-marker';
    year: number;
}

export type TimelineItem = Artwork | YearMarker;
