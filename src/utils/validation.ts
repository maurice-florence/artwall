// src/utils/validation.ts
export const validateArtwork = (data: ArtworkFormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.title.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.year = 'Please enter a valid year';
  }
  
  return errors;
};