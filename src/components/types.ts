
// Types for the timeline app
export type { Artwork, ArtworkFormData } from '@/types';

export interface ViewOptions {
  spacing: 'compact' | 'comfortabel';
  layout: 'alternerend' | 'enkelzijdig';
  details: 'volledig' | 'titels';
  animations: boolean;
  theme: string;
}
