// src/components/AdminModal/types.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\types.ts
import type { Artwork, ArtworkFormData, ValidationErrors } from '@/types';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkToEdit?: Artwork | null;
}

export interface FormComponentProps {
  formData: ArtworkFormData;
  errors: ValidationErrors;
  updateField: (field: keyof ArtworkFormData, value: any) => void;
  isFieldLoading?: (field: string) => boolean;
  shouldShowField?: (field: keyof ArtworkFormData) => boolean;
  isFieldRequired?: (field: keyof ArtworkFormData) => boolean;
  shouldAnimateField?: (field: keyof ArtworkFormData) => boolean;
  getContextualHelpText?: (field: keyof ArtworkFormData) => string;
  getSmartSuggestions?: (field: keyof ArtworkFormData) => string[];
}

export interface UseAdminModalReturn {
  formData: ArtworkFormData;
  errors: ValidationErrors;
  isLoading: boolean;
  message: string;
  updateField: (field: keyof ArtworkFormData, value: any) => void;
  handleSubmit: () => Promise<boolean>;
  resetForm: () => void;
}

export interface FormState {
  isLoading: boolean;
  error: string;
  success: string;
  validation: ValidationErrors;
}

// Re-export for convenience
export type { ArtworkFormData, ValidationErrors } from '@/types';