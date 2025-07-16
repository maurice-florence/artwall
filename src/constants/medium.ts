// src/constants/medium.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\constants\medium.ts

import { 
  ArtworkMedium, 
  DrawingSubtype, 
  WritingSubtype, 
  MusicSubtype, 
  SculptureSubtype, 
  PhotographySubtype, 
  VideoSubtype 
} from '@/types';

export const MEDIUMS: ArtworkMedium[] = [
  'drawing',
  'writing', 
  'music',
  'sculpture',
  'photography',
  'video',
  'other'
];

export const MEDIUM_LABELS: Record<ArtworkMedium, string> = {
  drawing: 'Tekenen',
  writing: 'Schrijven',
  music: 'Muziek',
  sculpture: 'Beeldhouwen',
  photography: 'Fotografie',
  video: 'Video',
  other: 'Overig'
};

// Subtype mappings per medium
export const DRAWING_SUBTYPES: DrawingSubtype[] = [
  'marker',
  'pencil',
  'digital',
  'ink',
  'charcoal',
  'other'
];

export const WRITING_SUBTYPES: WritingSubtype[] = [
  'poem',
  'prose',
  'story',
  'essay',
  'other'
];

export const MUSIC_SUBTYPES: MusicSubtype[] = [
  'instrumental',
  'vocal',
  'electronic',
  'acoustic',
  'other'
];

export const SCULPTURE_SUBTYPES: SculptureSubtype[] = [
  'clay',
  'wood',
  'metal',
  'stone',
  'other'
];

export const PHOTOGRAPHY_SUBTYPES: PhotographySubtype[] = [
  'portrait',
  'landscape',
  'street',
  'abstract',
  'other'
];

export const VIDEO_SUBTYPES: VideoSubtype[] = [
  'documentary',
  'narrative',
  'experimental',
  'animation',
  'other'
];

export const SUBTYPE_LABELS: Record<string, string> = {
  // Drawing
  marker: 'Marker',
  pencil: 'Potlood',
  digital: 'Digitaal',
  ink: 'Inkt',
  charcoal: 'Houtskool',
  
  // Writing
  poem: 'Gedicht',
  prose: 'Proza',
  story: 'Verhaal',
  essay: 'Essay',
  
  // Music
  instrumental: 'Instrumentaal',
  vocal: 'Vocaal',
  electronic: 'Elektronisch',
  acoustic: 'Akoestisch',
  
  // Sculpture
  clay: 'Klei',
  wood: 'Hout',
  metal: 'Metaal',
  stone: 'Steen',
  
  // Photography
  portrait: 'Portret',
  landscape: 'Landschap',
  street: 'Straatfotografie',
  abstract: 'Abstract',
  
  // Video
  documentary: 'Documentaire',
  narrative: 'Verhaal',
  experimental: 'Experimenteel',
  animation: 'Animatie',
  
  // Common
  other: 'Overig'
};

export const getSubtypesForMedium = (medium: ArtworkMedium): string[] => {
  switch (medium) {
    case 'drawing':
      return DRAWING_SUBTYPES;
    case 'writing':
      return WRITING_SUBTYPES;
    case 'music':
      return MUSIC_SUBTYPES;
    case 'sculpture':
      return SCULPTURE_SUBTYPES;
    case 'photography':
      return PHOTOGRAPHY_SUBTYPES;
    case 'video':
      return VIDEO_SUBTYPES;
    default:
      return ['other'];
  }
};

// Category mapping for backwards compatibility
export const MEDIUM_TO_CATEGORY_MAP: Record<ArtworkMedium, string> = {
  drawing: 'drawing',
  writing: 'poetry', // Default to poetry for writing
  music: 'music',
  sculpture: 'sculpture',
  photography: 'image',
  video: 'video',
  other: 'other'
};

export const CATEGORY_TO_MEDIUM_MAP: Record<string, ArtworkMedium> = {
  drawing: 'drawing',
  poetry: 'writing',
  prosepoetry: 'writing',
  prose: 'writing',
  music: 'music',
  sculpture: 'sculpture',
  image: 'photography',
  video: 'video',
  other: 'other'
};
