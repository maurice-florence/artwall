export interface Artwork {
  id: string;
  title: string;
  year: number;
  month?: number;
  day?: number;
  category: string;
  description: string;
  mediaType: string;
  content: string;
  lyrics?: string;
  chords?: string;
  soundcloudEmbedUrl?: string;
  soundcloudTrackUrl?: string;
  isHidden?: boolean;
  mediaUrl?: string;
  coverImageUrl?: string;
}
