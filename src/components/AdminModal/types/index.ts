// src/components/AdminModal/types/index.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\types\index.ts
import { Artwork } from '@/types';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkToEdit?: Artwork | null;
}

export interface ArtworkFormData {
  // Basic fields
  title: string;
  year: number;
  month: number | null;
  day: number | null;
  category: Artwork["category"];
  description: string;
  content: string;
  isHidden: boolean;
  
  // Metadata fields
  version: string;
  language: string;
  language1: string;
  language2: string;
  language3: string;
  location1: string;
  location2: string;
  tags: string;
  url1: string;
  url2: string;
  url3: string;
  
  // Category-specific fields
  lyrics: string;
  chords: string;
  soundcloudEmbedUrl: string;
  soundcloudTrackUrl: string;
  mediaType: string;
  coverImageUrl: string;
  audioUrl: string;
  pdfUrl: string;
  mediaUrl: string;
  mediaUrls: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface FormState {
  isLoading: boolean;
  error: string;
  success: string;
  validation: ValidationErrors;
}

export interface FileState {
  file: File | null;
  coverFile: File | null;
  coverPreview: string | null;
  filePreview: string | null;
}