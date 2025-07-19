// src/components/AdminModal/hooks/useArtworkForm.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useArtworkForm.ts
import { useState, useEffect } from 'react';
import { Artwork, ArtworkFormData } from '@/types';
import { FormState, ValidationErrors } from '../types';
import { validateArtworkForm } from '../utils/validation';

// Define initial form data locally to avoid import conflict
const getInitialFormData = (): ArtworkFormData => {
  return {
    title: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    medium: 'writing',
    subtype: 'poem',
    // Removed category field, only medium/subtype used
    description: '',
    content: '',
    isHidden: false,
    version: '01',
    language1: 'nl',
    tags: [],
    lyrics: '',
    chords: '',
    soundcloudEmbedUrl: '',
    soundcloudTrackUrl: '',
    mediaType: 'text',
    coverImageUrl: '',
    audioUrl: '',
    pdfUrl: '',
    mediaUrl: '',
    mediaUrls: [],
    location1: '',
    location2: '',
    language2: '',
    language3: '',
    url1: '',
    url2: '',
    url3: ''
  };
};

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
    // ✅ validateArtworkForm now returns ValidationErrors directly
    const validationErrors = validateArtworkForm(formData);
    setFormState((prev: FormState) => ({ ...prev, validation: validationErrors }));
  }, [formData]);

  const updateField = <K extends keyof ArtworkFormData>(
    field: K,
    value: ArtworkFormData[K]
  ) => {
    setFormData((prev: ArtworkFormData) => ({ ...prev, [field]: value }));
  };

  const setError = (error: string) => {
    setFormState((prev: FormState) => ({ ...prev, error, success: '' }));
  };

  const setSuccess = (success: string) => {
    setFormState((prev: FormState) => ({ ...prev, success, error: '' }));
  };

  const setLoading = (isLoading: boolean) => {
    setFormState((prev: FormState) => ({ ...prev, isLoading }));
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
    medium: extendedArtwork.medium || 'writing',
    subtype: extendedArtwork.subtype || 'poem',
    description: artwork.description || '',
    content: extendedArtwork.content || '',
    isHidden: !!artwork.isHidden,
    
    version: extendedArtwork.version || '01',
    language1: extendedArtwork.language1 || extendedArtwork.language || 'en',
    language2: extendedArtwork.language2 || '',
    language3: extendedArtwork.language3 || '',
    location1: extendedArtwork.location1 || '',
    location2: extendedArtwork.location2 || '',
    
    tags: Array.isArray(extendedArtwork.tags) 
      ? extendedArtwork.tags
      : extendedArtwork.tags ? [extendedArtwork.tags] : [],
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
      ? extendedArtwork.mediaUrls
      : extendedArtwork.mediaUrls ? [extendedArtwork.mediaUrls] : []
  };
};