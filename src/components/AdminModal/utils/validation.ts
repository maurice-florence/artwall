// src/components/AdminModal/utils/validation.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\utils\validation.ts
import { ArtworkFormData } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'custom';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  fieldErrors: ValidationError[];
}

// Main validation function that returns ValidationErrors for compatibility
export const validateArtworkForm = (formData: ArtworkFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Enhanced title validation
  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = 'Titel is verplicht';
  } else if (formData.title.length > 200) {
    errors.title = 'Titel mag maximaal 200 tekens bevatten';
  }

  // Enhanced year validation
  const currentYear = new Date().getFullYear();
  if (!formData.year) {
    errors.year = 'Jaar is verplicht';
  } else if (formData.year < 1900 || formData.year > currentYear + 1) {
    errors.year = `Jaar moet tussen 1900 en ${currentYear + 1} liggen`;
  }

  // Enhanced month validation
  if (formData.month && (formData.month < 1 || formData.month > 12)) {
    errors.month = 'Maand moet tussen 1 en 12 zijn';
  }

  // Enhanced day validation
  if (formData.day && (formData.day < 1 || formData.day > 31)) {
    errors.day = 'Dag moet tussen 1 en 31 zijn';
  }

  // URL validation
  const urlFields = ['soundcloudEmbedUrl', 'soundcloudTrackUrl', 'mediaUrl'];
  urlFields.forEach(field => {
    const url = formData[field as keyof ArtworkFormData] as string;
    if (url && !isValidUrl(url)) {
      errors[field] = 'Voer een geldige URL in';
    }
  });

  // Content validation
  if (formData.content && formData.content.length > 50000) {
    errors.content = 'Content is te lang (max 50.000 tekens)';
  }

  return errors;
};

// Enhanced validation function that returns full ValidationResult
export const validateArtworkFormEnhanced = (formData: ArtworkFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const fieldErrors: ValidationError[] = [];

  // Enhanced title validation
  if (!formData.title || formData.title.trim().length === 0) {
    errors.title = 'Titel is verplicht';
    fieldErrors.push({
      field: 'title',
      message: 'Titel is verplicht',
      type: 'required'
    });
  } else if (formData.title.length > 200) {
    errors.title = 'Titel mag maximaal 200 tekens bevatten';
    fieldErrors.push({
      field: 'title',
      message: 'Titel mag maximaal 200 tekens bevatten',
      type: 'range'
    });
  } else if (formData.title.length < 3) {
    warnings.title = 'Titel is erg kort, overweeg een beschrijvendere titel';
  }

  // Enhanced year validation
  const currentYear = new Date().getFullYear();
  if (!formData.year) {
    errors.year = 'Jaar is verplicht';
    fieldErrors.push({
      field: 'year',
      message: 'Jaar is verplicht',
      type: 'required'
    });
  } else if (formData.year < 1900 || formData.year > currentYear + 1) {
    errors.year = `Jaar moet tussen 1900 en ${currentYear + 1} liggen`;
    fieldErrors.push({
      field: 'year',
      message: `Jaar moet tussen 1900 en ${currentYear + 1} liggen`,
      type: 'range'
    });
  }

  // Enhanced month validation
  if (formData.month && (formData.month < 1 || formData.month > 12)) {
    errors.month = 'Maand moet tussen 1 en 12 zijn';
    fieldErrors.push({
      field: 'month',
      message: 'Maand moet tussen 1 en 12 zijn',
      type: 'range'
    });
  }

  // Enhanced day validation
  if (formData.day && (formData.day < 1 || formData.day > 31)) {
    errors.day = 'Dag moet tussen 1 en 31 zijn';
    fieldErrors.push({
      field: 'day',
      message: 'Dag moet tussen 1 en 31 zijn',
      type: 'range'
    });
  }

  // Medium-specific validation
  if (formData.medium === 'audio') {
    if (!formData.lyrics && !formData.content) {
      warnings.lyrics = 'Muziek zonder tekst of content - overweeg toevoegen van lyrics';
    }
  }

  // Content validation with smart suggestions
  if (formData.content && formData.content.length > 10000) {
    warnings.content = 'Content is erg lang - overweeg opsplitsen in meerdere werken';
  }

  // URL validation
  const urlFields = ['soundcloudEmbedUrl', 'soundcloudTrackUrl', 'mediaUrl'];
  urlFields.forEach(field => {
    const url = formData[field as keyof ArtworkFormData] as string;
    if (url && !isValidUrl(url)) {
      errors[field] = 'Voer een geldige URL in';
      fieldErrors.push({
        field,
        message: 'Voer een geldige URL in',
        type: 'format'
      });
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    fieldErrors
  };
};

// Real-time validation for better UX
export const validateField = (
  field: string, 
  value: any, 
  formData: ArtworkFormData
): { error?: string; warning?: string } => {
  const result = validateArtworkFormEnhanced({ ...formData, [field]: value });
  return {
    error: result.errors[field],
    warning: result.warnings[field]
  };
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};