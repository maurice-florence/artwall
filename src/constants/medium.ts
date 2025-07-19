// src/constants/medium.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\constants\medium.ts


// Centralized medium and subtype definitions from JSON
import mediumSubtypesJson from './medium-subtypes.json';

export type ArtworkMedium = keyof typeof mediumSubtypesJson;
export type ArtworkSubtype = string;

export const MEDIUMS: ArtworkMedium[] = Object.keys(mediumSubtypesJson) as ArtworkMedium[];

export const MEDIUM_LABELS: Record<ArtworkMedium, string> = {
  audio: 'Audio',
  writing: 'Schrijven',
  drawing: 'Tekenen',
  sculpture: 'Beeldhouwen',
  other: 'Overig'
};

export const getSubtypesForMedium = (medium: ArtworkMedium): string[] => {
  return mediumSubtypesJson[medium] || ['other'];
};

export const SUBTYPE_LABELS: Record<string, string> = {
  // Audio
  beat: 'Beat',
  electronic: 'Elektronisch',
  rap: 'Rap',
  song: 'Song',
  soundpoem: 'Soundpoem',
  // Writing
  essay: 'Essay',
  novel: 'Roman',
  poem: 'Gedicht',
  prosepoem: 'Prozagedicht',
  shortstory: 'Kort verhaal',
  // Drawing
  digital: 'Digitaal',
  marker: 'Marker',
  pencil: 'Potlood',
  // Sculpture
  clay: 'Klei',
  wood: 'Hout',
  // Common
  other: 'Overig'
};

// Only keep the new JSON-driven implementation
