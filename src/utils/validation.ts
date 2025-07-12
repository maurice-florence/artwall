// src/utils/validation.ts
import { ArtworkFormData } from '@/types';

export interface ValidationErrors {
  [key: string]: string;
}

export const validateArtworkForm = (data: ArtworkFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Titel is verplicht';
  }
  
  if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.year = 'Voer een geldig jaar in';
  }
  
  if (data.month && (data.month < 1 || data.month > 12)) {
    errors.month = 'Maand moet tussen 1 en 12 zijn';
  }
  
  if (data.day && (data.day < 1 || data.day > 31)) {
    errors.day = 'Dag moet tussen 1 en 31 zijn';
  }
  
  return errors;
};

// Keep the old function for backwards compatibility
export const validateArtwork = validateArtworkForm;