// src/constants/medium.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\constants\medium.ts

import { 
  ArtworkMedium, 
  DrawingSubtype, 
  WritingSubtype, 
  AudioSubtype, 
  SculptureSubtype 
} from '@/types';

export const MEDIUMS: ArtworkMedium[] = [
  'drawing',
  'writing', 
  'audio',
  'sculpture',
  'other'
];

export const MEDIUM_LABELS: Record<ArtworkMedium, string> = {
  drawing: 'Tekenen',
  writing: 'Schrijven',
  audio: 'Audio',
  sculpture: 'Beeldhouwen',
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
  'poetry',
  'prosepoetry',
  'novel',
  'short story',
  'essay',
  'other'
];

export const AUDIO_SUBTYPES: AudioSubtype[] = [
  'song',
  'rap',
  'beat',
  'instrumental',
  'electronic',
  'sound poem',
  'spoken word',
  'midi',
  'other'
];

export const SCULPTURE_SUBTYPES: SculptureSubtype[] = [
  'clay',
  'wood',
  'metal',
  'stone',
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
  poetry: 'Gedicht',
  prosepoetry: 'Proza-poëzie',
  novel: 'Roman',
  'short story': 'Kortverhaal',
  essay: 'Essay',
  
  // Audio
  song: 'Lied',
  rap: 'Rap',
  beat: 'Beat',
  instrumental: 'Instrumentaal',
  electronic: 'Elektronisch',
  'sound poem': 'Geluidsgedicht',
  'spoken word': 'Gesproken woord',
  midi: 'MIDI',
  
  // Sculpture
  clay: 'Klei',
  wood: 'Hout',
  metal: 'Metaal',
  stone: 'Steen',
  
  // Common
  other: 'Overig'
};

export const getSubtypesForMedium = (medium: ArtworkMedium): string[] => {
  switch (medium) {
    case 'drawing':
      return DRAWING_SUBTYPES;
    case 'writing':
      return WRITING_SUBTYPES;
    case 'audio':
      return AUDIO_SUBTYPES;
    case 'sculpture':
      return SCULPTURE_SUBTYPES;
    default:
      return ['other'];
  }
};

// Category mapping for backwards compatibility
export const MEDIUM_TO_CATEGORY_MAP: Record<ArtworkMedium, string> = {
  drawing: 'drawing',
  writing: 'poetry', // Default to poetry for writing
  audio: 'music',
  sculpture: 'sculpture',
  other: 'other'
};

export const CATEGORY_TO_MEDIUM_MAP: Record<string, ArtworkMedium> = {
  drawing: 'drawing',
  poetry: 'writing',
  prosepoetry: 'writing',
  prose: 'writing',
  music: 'audio',
  sculpture: 'sculpture',
  image: 'drawing', // Map image to drawing
  other: 'other'
};
