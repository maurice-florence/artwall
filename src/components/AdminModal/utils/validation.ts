// src/components/AdminModal/utils/validation.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\utils\validation.ts
import { ArtworkFormData } from '@/types';
import { ValidationErrors } from '../types';

export const validateArtworkForm = (data: ArtworkFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Titel is verplicht.';
  }
  
  if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.year = 'Voer een geldig jaar in.';
  }
  
  if (data.month && (data.month < 1 || data.month > 12)) {
    errors.month = 'Maand moet tussen 1 en 12 zijn.';
  }
  
  if (data.day && (data.day < 1 || data.day > 31)) {
    errors.day = 'Dag moet tussen 1 en 31 zijn.';
  }
  
  return errors;
};

export const getCategoryFields = (category: string): string[] => {
  const categoryFields: Record<string, string[]> = {
    poetry: ["title", "year", "month", "day", "description", "content"],
    prosepoetry: ["title", "year", "month", "day", "description", "content"],
    prose: ["title", "year", "month", "day", "description", "content", "coverImageUrl", "pdfUrl"],
    music: ["title", "year", "month", "day", "description", "lyrics", "chords", "soundcloudEmbedUrl", "soundcloudTrackUrl", "audioUrl"],
    sculpture: ["title", "year", "month", "day", "description", "coverImageUrl"],
    drawing: ["title", "year", "month", "day", "description", "coverImageUrl"],
    image: ["title", "year", "month", "day", "description", "coverImageUrl"],
    video: ["title", "year", "month", "day", "description", "mediaUrl"],
    other: ["title", "year", "month", "day", "description", "content", "mediaUrl"],
  };
  return categoryFields[category] || [];
};

export const getInitialFormData = (): ArtworkFormData => {
  return {
    title: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    category: 'poetry',
    description: '',
    content: '',
    isHidden: false,
    version: '01',
    language: 'nl',
    tags: [],
    lyrics: '',
    chords: '',
    soundcloudEmbedUrl: '',
    soundcloudTrackUrl: '',
    mediaType: 'text',
    coverImageUrl: '',
    audioUrl: '',
    pdfUrl: '',
    mediaUrl: '',
    mediaUrls: [],
    location1: '',
    location2: '',
    language1: '',
    language2: '',
    language3: '',
    url1: '',
    url2: '',
    url3: ''
  };
};