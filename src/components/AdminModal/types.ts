import { Artwork, ArtworkFormData } from '@/types';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkToEdit: Artwork | null;
}

export interface FormComponentProps {
  formData: ArtworkFormData;
  errors: any;
  updateField: (field: keyof ArtworkFormData, value: any) => void;
  isFieldLoading?: (field: keyof ArtworkFormData) => boolean;
  shouldShowField?: (field: keyof ArtworkFormData) => boolean;
  isFieldRequired?: (field: keyof ArtworkFormData) => boolean;
  shouldAnimateField?: (field: keyof ArtworkFormData) => boolean;
  getContextualHelpText?: (field: keyof ArtworkFormData) => string | undefined;
  getSmartSuggestions?: (field: keyof ArtworkFormData) => string[] | undefined;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormState {
  [key: string]: any;
}