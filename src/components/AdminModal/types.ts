// src/components/AdminModal/types.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\types.ts
import { Artwork, ArtworkFormData } from '@/types';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkToEdit?: Artwork | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormComponentProps {
  formData: ArtworkFormData;
  errors: ValidationErrors;
  updateField: (field: keyof ArtworkFormData, value: any) => void;
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

// Re-export ArtworkFormData for convenience
export type { ArtworkFormData };