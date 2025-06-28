// Types for the timeline app
export interface Artwork {
  id: string;
  title: string;
  year: number;
  month?: number;
  day?: number;
  category: string;
  mediaType: string;
  description?: string;
  content?: string;
  lyrics?: string;
  chords?: string;
  soundcloudEmbedUrl?: string;
  soundcloudTrackUrl?: string;
  isHidden?: boolean;
  mediaUrl?: string;
  coverImageUrl?: string;
}

export interface FilterOptions {
  category: string;
  year: string;
}

export interface ViewOptions {
  spacing: 'compact' | 'comfortabel';
  layout: 'alternerend' | 'enkelzijdig';
  details: 'volledig' | 'titels';
  animations: boolean;
  theme: string;
}
