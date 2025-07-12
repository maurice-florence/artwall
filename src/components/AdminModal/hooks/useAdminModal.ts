// src/components/AdminModal/hooks/useAdminModal.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useAdminModal.ts
import { useState, useEffect } from 'react';
import { Artwork, ArtworkFormData } from '@/types';
import { validateArtworkForm, ValidationErrors } from '@/utils/validation';
import { createArtwork, updateArtwork } from '@/utils/firebase-operations';

const initialFormData: ArtworkFormData = {
  title: '',
  year: new Date().getFullYear(), // Changed from null to number
  month: undefined, // Changed from null to undefined
  day: undefined, // Changed from null to undefined
  category: 'poetry',
  description: '',
  content: '',
  isHidden: false,
  version: '01',
  language: 'nl',
  tags: [], // Changed from string to array
  
  // Initialize other fields
  lyrics: '',
  chords: '',
  soundcloudEmbedUrl: '',
  soundcloudTrackUrl: '',
  mediaUrl: '',
  coverImageUrl: '',
  pdfUrl: '',
  audioUrl: '',
  mediaUrls: [],
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

  // Load artwork data when editing
  useEffect(() => {
    if (artworkToEdit) {
      setFormData({
        ...initialFormData,
        ...artworkToEdit,
        tags: Array.isArray(artworkToEdit.tags) ? artworkToEdit.tags : []
      });
    } else {
      setFormData(initialFormData);
    }
  }, [artworkToEdit]);

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
  };

  const handleSubmit = async (): Promise<boolean> => {
    setIsLoading(true);
    setErrors({});
    setMessage('');

    try {
      // Validate form
      const validationErrors = validateArtworkForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return false;
      }

      // Submit to Firebase
      const result = artworkToEdit
        ? await updateArtwork(artworkToEdit.id, formData)
        : await createArtwork(formData);

      if (result.success) {
        setMessage(artworkToEdit ? 'Kunstwerk bijgewerkt!' : 'Kunstwerk opgeslagen!');
        return true;
      } else {
        setErrors({ general: result.error || 'Er is een fout opgetreden' });
        return false;
      }
    } catch (error) {
      setErrors({ general: 'Er is een onverwachte fout opgetreden' });
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
    updateField,
    handleSubmit,
    resetForm
  };
};