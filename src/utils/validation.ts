// src/utils/validation.ts


import type { ArtworkFormData, ValidationErrors } from '@/types';
import { VALIDATION_RULES } from '@/constants/validation';

export const validateArtworkForm = (data: ArtworkFormData): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Titel is verplicht';
  }
  if (!data.year || data.year < VALIDATION_RULES.YEAR_MIN || data.year > VALIDATION_RULES.YEAR_MAX) {
    errors.year = `Voer een geldig jaar in (${VALIDATION_RULES.YEAR_MIN}-${VALIDATION_RULES.YEAR_MAX})`;
  }
  if (data.month && (data.month < VALIDATION_RULES.MONTH_MIN || data.month > VALIDATION_RULES.MONTH_MAX)) {
    errors.month = `Maand moet tussen ${VALIDATION_RULES.MONTH_MIN} en ${VALIDATION_RULES.MONTH_MAX} zijn`;
  }
  if (data.day && (data.day < VALIDATION_RULES.DAY_MIN || data.day > VALIDATION_RULES.DAY_MAX)) {
    errors.day = `Dag moet tussen ${VALIDATION_RULES.DAY_MIN} en ${VALIDATION_RULES.DAY_MAX} zijn`;
  }
  return errors;
};

// Keep the old function for backwards compatibility
export const validateArtwork = validateArtworkForm;