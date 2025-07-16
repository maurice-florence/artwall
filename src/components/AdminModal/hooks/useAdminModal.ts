// src/components/AdminModal/hooks/useAdminModal.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useAdminModal.ts
import { useState, useEffect } from 'react';
import { Artwork, ArtworkFormData } from '@/types';
import { validateArtworkForm } from '../utils/validation';
import { ValidationErrors } from '../types';
import { createArtwork, updateArtwork } from '../utils/firebaseOperations';
import { useLoadingState } from './useLoadingState';
import { useAutoSave } from './useAutoSave';

const initialFormData: ArtworkFormData = {
  title: '',
  year: new Date().getFullYear(),
  month: undefined,
  day: undefined,
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
  mediaUrl: '',
  mediaUrls: [],
  mediaType: 'text',
  coverImageUrl: '',
  audioUrl: '',
  pdfUrl: '',
  location1: '',
  location2: '',
  language1: '',
  language2: '',
  language3: '',
  url1: '',
  url2: '',
  url3: ''
};

export const useAdminModal = (artworkToEdit?: Artwork | null) => {
  const [formData, setFormData] = useState<ArtworkFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { loadingState, setLoading, setError, clearLoading, isFieldLoading } = useLoadingState();
  
  // Auto-save functionality
  const { loadDraft, clearDraft, hasDraft } = useAutoSave(formData, {
    enabled: !artworkToEdit, // Only auto-save for new artworks
    delay: 3000, // Save every 3 seconds
    key: 'artwall-new-artwork-draft'
  });

  // Initialize form data when artwork changes
  useEffect(() => {
    if (artworkToEdit) {
      setFormData(mapArtworkToFormData(artworkToEdit));
    } else {
      // Try to load draft for new artwork
      const draft = loadDraft();
      if (draft) {
        setFormData(draft);
        setMessage('Draft loaded - your previous work has been restored.');
      } else {
        setFormData(initialFormData);
      }
    }
  }, [artworkToEdit, loadDraft]);

  const mapArtworkToFormData = (artwork: Artwork): ArtworkFormData => {
    const extendedArtwork = artwork as any;
    
    return {
      title: artwork.title || '',
      year: artwork.year || new Date().getFullYear(),
      month: artwork.month,
      day: artwork.day,
      category: artwork.category || 'poetry',
      description: artwork.description || '',
      content: extendedArtwork.content || '',
      isHidden: !!artwork.isHidden,
      version: extendedArtwork.version || '01',
      language: extendedArtwork.language || 'nl',
      tags: Array.isArray(extendedArtwork.tags) ? extendedArtwork.tags : [],
      lyrics: extendedArtwork.lyrics || '',
      chords: extendedArtwork.chords || '',
      soundcloudEmbedUrl: extendedArtwork.soundcloudEmbedUrl || '',
      soundcloudTrackUrl: extendedArtwork.soundcloudTrackUrl || '',
      mediaUrl: extendedArtwork.mediaUrl || '',
      mediaUrls: Array.isArray(extendedArtwork.mediaUrls) ? extendedArtwork.mediaUrls : [],
      mediaType: extendedArtwork.mediaType || 'text',
      coverImageUrl: extendedArtwork.coverImageUrl || '',
      audioUrl: extendedArtwork.audioUrl || '',
      pdfUrl: extendedArtwork.pdfUrl || '',
      location1: extendedArtwork.location1 || '',
      location2: extendedArtwork.location2 || '',
      language1: extendedArtwork.language1 || '',
      language2: extendedArtwork.language2 || '',
      language3: extendedArtwork.language3 || '',
      url1: extendedArtwork.url1 || '',
      url2: extendedArtwork.url2 || '',
      url3: extendedArtwork.url3 || ''
    };
  };

  const updateField = (field: keyof ArtworkFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setMessage('');
    
    // Clear draft when resetting form
    if (!artworkToEdit) {
      clearDraft();
    }
  };

  const handleSubmit = async (): Promise<boolean> => {
    setIsLoading(true);
    setLoading('form');
    setErrors({});
    setMessage('');

    try {
      // ✅ validateArtworkForm now returns ValidationErrors directly
      const validationErrors = validateArtworkForm(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        clearLoading();
        return false;
      }

      // Submit to Firebase
      const result = artworkToEdit
        ? await updateArtwork(artworkToEdit.id, formData)
        : await createArtwork(formData);

      if (result.success) {
        setMessage(artworkToEdit ? 'Kunstwerk bijgewerkt!' : 'Kunstwerk opgeslagen!');
        
        // Clear draft on successful submission (for new artwork)
        if (!artworkToEdit) {
          clearDraft();
        }
        
        clearLoading();
        return true;
      } else {
        setErrors({ general: result.error || 'Er is een fout opgetreden' });
        setError(result.error || 'Er is een fout opgetreden');
        return false;
      }
    } catch (error) {
      const errorMessage = 'Er is een onverwachte fout opgetreden';
      setErrors({ general: errorMessage });
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    message,
    loadingState,
    updateField,
    handleSubmit,
    resetForm,
    isFieldLoading,
    hasDraft: hasDraft(),
    loadDraft,
    clearDraft
  };
};