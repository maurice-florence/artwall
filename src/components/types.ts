// Types for the timeline app
export interface Artwork {
  id: string;
  title: string;
  year: number;
  month?: number;
  day?: number;
  medium: string;
  mediaType: string;
  description?: string;
  content?: string;
  lyrics?: string;
  chords?: string;
  soundcloudEmbedUrl?: string;
  soundcloudTrackUrl?: string;
  isHidden?: boolean;
  mediaUrl?: string;
  coverImageUrl?: string;
}

export interface ViewOptions {
  spacing: 'compact' | 'comfortabel';
  layout: 'alternerend' | 'enkelzijdig';
  details: 'volledig' | 'titels';
  animations: boolean;
  theme: string;
}

// src/components/AdminModal/types.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\types.ts
import { ArtworkFormData } from '@/types';

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
