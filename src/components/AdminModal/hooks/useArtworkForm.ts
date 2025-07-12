// src/components/AdminModal/hooks/useArtworkForm.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useArtworkForm.ts
import { useState, useEffect } from 'react';
import { Artwork } from '@/types';
import { ArtworkFormData, FormState, ValidationErrors } from '../types';
import { validateArtworkForm, getInitialFormData } from '../utils/validation';

export const useArtworkForm = (artworkToEdit?: Artwork | null) => {
  const [formData, setFormData] = useState<ArtworkFormData>(getInitialFormData());
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
    error: '',
    success: '',
    validation: {}
  });

  // Initialize form data
  useEffect(() => {
    if (artworkToEdit) {
      setFormData(mapArtworkToFormData(artworkToEdit));
    } else {
      setFormData(getInitialFormData());
    }
  }, [artworkToEdit]);

  // Validate form on data change
  useEffect(() => {
    const validation = validateArtworkForm(formData);
    setFormState(prev => ({ ...prev, validation }));
  }, [formData]);

  const updateField = <K extends keyof ArtworkFormData>(
    field: K,
    value: ArtworkFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const setError = (error: string) => {
    setFormState(prev => ({ ...prev, error, success: '' }));
  };

  const setSuccess = (success: string) => {
    setFormState(prev => ({ ...prev, success, error: '' }));
  };

  const setLoading = (isLoading: boolean) => {
    setFormState(prev => ({ ...prev, isLoading }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setFormState({
      isLoading: false,
      error: '',
      success: '',
      validation: {}
    });
  };

  return {
    formData,
    formState,
    updateField,
    setError,
    setSuccess,
    setLoading,
    resetForm
  };
};

// Helper function to map artwork to form data
const mapArtworkToFormData = (artwork: Artwork): ArtworkFormData => {
  const extendedArtwork = artwork as any;
  
  return {
    title: artwork.title || '',
    year: artwork.year || new Date().getFullYear(),
    month: artwork.month || new Date().getMonth() + 1,
    day: artwork.day || new Date().getDate(),
    category: artwork.category || 'poetry',
    description: artwork.description || '',
    content: extendedArtwork.content || '',
    isHidden: !!artwork.isHidden,
    
    version: extendedArtwork.version || '01',
    language: extendedArtwork.language || 'en',
    language1: extendedArtwork.language1 || '',
    language2: extendedArtwork.language2 || '',
    language3: extendedArtwork.language3 || '',
    location1: extendedArtwork.location1 || '',
    location2: extendedArtwork.location2 || '',
    tags: Array.isArray(extendedArtwork.tags) 
      ? extendedArtwork.tags.join(', ') 
      : extendedArtwork.tags || '',
    url1: extendedArtwork.url1 || '',
    url2: extendedArtwork.url2 || '',
    url3: extendedArtwork.url3 || '',
    
    lyrics: extendedArtwork.lyrics || '',
    chords: extendedArtwork.chords || '',
    soundcloudEmbedUrl: extendedArtwork.soundcloudEmbedUrl || '',
    soundcloudTrackUrl: extendedArtwork.soundcloudTrackUrl || '',
    mediaType: extendedArtwork.mediaType || 'text',
    coverImageUrl: extendedArtwork.coverImageUrl || '',
    audioUrl: extendedArtwork.audioUrl || '',
    pdfUrl: extendedArtwork.pdfUrl || '',
    mediaUrl: extendedArtwork.mediaUrl || '',
    mediaUrls: Array.isArray(extendedArtwork.mediaUrls)
      ? extendedArtwork.mediaUrls.join('\n')
      : extendedArtwork.mediaUrls || ''
  };
};