// src/constants/medium.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\constants\medium.ts

// Centralized medium and subtype definitions
export type ArtworkMedium = 'audio' | 'writing' | 'drawing' | 'sculpture' | 'other';

export type AudioSubtype = 'instrumental' | 'vocal' | 'electronic' | 'acoustic' | 'other';
export type WritingSubtype = 'poem' | 'prose' | 'story' | 'essay' | 'other';
export type DrawingSubtype = 'marker' | 'pencil' | 'digital' | 'ink' | 'charcoal' | 'other';
export type SculptureSubtype = 'clay' | 'wood' | 'metal' | 'stone' | 'other';

export type ArtworkSubtype = AudioSubtype | WritingSubtype | DrawingSubtype | SculptureSubtype | 'other';

export const MEDIUMS: ArtworkMedium[] = [
  'audio',
  'writing',
  'drawing',
  'sculpture',
  'other'
];

export const MEDIUM_LABELS: Record<ArtworkMedium, string> = {
  audio: 'Audio',
  writing: 'Schrijven',
  drawing: 'Tekenen',
  sculpture: 'Beeldhouwen',
  other: 'Overig'
};

// Subtype mappings per medium
export const AUDIO_SUBTYPES: AudioSubtype[] = [
  'instrumental',
  'vocal',
  'electronic',
  'acoustic',
  'other'
];

export const WRITING_SUBTYPES: WritingSubtype[] = [
  'poem',
  'prose',
  'story',
  'essay',
  'other'
];

export const DRAWING_SUBTYPES: DrawingSubtype[] = [
  'marker',
  'pencil',
  'digital',
  'ink',
  'charcoal',
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
  // Audio
  instrumental: 'Instrumentaal',
  vocal: 'Vocaal',
  electronic: 'Elektronisch',
  acoustic: 'Akoestisch',
  // Writing
  poem: 'Gedicht',
  prose: 'Proza',
  story: 'Verhaal',
  essay: 'Essay',
  // Drawing
  marker: 'Marker',
  pencil: 'Potlood',
  digital: 'Digitaal',
  ink: 'Inkt',
  charcoal: 'Houtskool',
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
    case 'audio':
      return AUDIO_SUBTYPES;
    case 'writing':
      return WRITING_SUBTYPES;
    case 'drawing':
      return DRAWING_SUBTYPES;
    case 'sculpture':
      return SCULPTURE_SUBTYPES;
    default:
      return ['other'];
  }
};
