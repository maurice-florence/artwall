// src/components/AdminModal/hooks/useSmartFormLogic.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useSmartFormLogic.ts
import { useState, useEffect, useCallback } from 'react';
import { ArtworkFormData } from '@/types';
import { 
  shouldShowField, 
  isFieldRequired, 
  applyDependencies, 
  applySmartDefaults,
  getVisibleFields,
  validateWithSmartLogic
} from '../utils/formLogic';

export interface SmartFormState {
  visibleFields: Array<keyof ArtworkFormData>;
  requiredFields: Array<keyof ArtworkFormData>;
  fieldStates: Record<string, {
    isVisible: boolean;
    isRequired: boolean;
    isDependency: boolean;
    hasWarning: boolean;
    warningMessage?: string;
  }>;
  smartValidation: {
    errors: string[];
    warnings: string[];
  };
}

export const useSmartFormLogic = (formData: ArtworkFormData) => {
  const [smartState, setSmartState] = useState<SmartFormState>({
    visibleFields: [],
    requiredFields: [],
    fieldStates: {},
    smartValidation: { errors: [], warnings: [] }
  });

  const [lastAppliedDefaults, setLastAppliedDefaults] = useState<Set<keyof ArtworkFormData>>(new Set());

  // Update smart state when form data changes
  useEffect(() => {
    const visibleFields = getVisibleFields(formData);
    const requiredFields = visibleFields.filter(field => isFieldRequired(field, formData));
    const validation = validateWithSmartLogic(formData);
    
    // Build field states
    const fieldStates: Record<string, SmartFormState['fieldStates'][string]> = {};
    
    const allPossibleFields: Array<keyof ArtworkFormData> = [
      'title', 'medium', 'subtype', 'year', 'month', 'day', 'description', 'content',
      'lyrics', 'chords', 'soundcloudEmbedUrl', 'soundcloudTrackUrl', 'audioUrl',
      'mediaType', 'mediaUrl', 'mediaUrls', 'coverImageUrl', 'pdfUrl',
      'version', 'language1', 'language2', 'language3',
      'location1', 'location2', 'tags',
      'url1', 'url2', 'url3', 'isHidden'
    ];
    
    allPossibleFields.forEach(field => {
      const isVisible = shouldShowField(field, formData);
      const isRequired = isFieldRequired(field, formData);
      
      fieldStates[field] = {
        isVisible,
        isRequired,
        isDependency: checkIfDependency(field, formData),
        hasWarning: validation.warnings.some(warning => warning.includes(field)),
        warningMessage: validation.warnings.find(warning => warning.includes(field))
      };
    });
    
    setSmartState({
      visibleFields,
      requiredFields,
      fieldStates,
      smartValidation: validation
    });
  }, [formData]);

  const checkIfDependency = useCallback((field: keyof ArtworkFormData, formData: ArtworkFormData): boolean => {
    // Check if this field depends on others
    const dependencyFields = ['language2', 'language3', 'url2', 'url3', 'location2'];
    return dependencyFields.includes(field);
  }, []);

  // Apply smart defaults when category changes
  const applySmartDefaultsForCategory = useCallback((formData: ArtworkFormData): Partial<ArtworkFormData> => {
    const defaults = applySmartDefaults(formData);
    
    // Track which defaults we've applied to avoid reapplying
    const newlyApplied = new Set(Object.keys(defaults) as Array<keyof ArtworkFormData>);
    setLastAppliedDefaults(newlyApplied);
    
    return defaults;
  }, []);

  // Apply field dependencies
  const applyFieldDependencies = useCallback((
    formData: ArtworkFormData, 
    changedField: keyof ArtworkFormData
  ): Partial<ArtworkFormData> => {
    return applyDependencies(formData, changedField);
  }, []);

  // Check if field should be animated when showing/hiding
  const shouldAnimateField = useCallback((field: keyof ArtworkFormData): boolean => {
    const animatedFields = ['language2', 'language3', 'url2', 'url3', 'location2'];
    return animatedFields.includes(field);
  }, []);

  // Get contextual help text for fields
  const getContextualHelpText = useCallback((field: keyof ArtworkFormData): string => {
    const helpTexts: Record<string, string> = {
      lyrics: 'Enter the song lyrics (optional if instrumental)',
      chords: 'Enter chord progressions (e.g., C - Am - F - G)',
      mediaType: 'Select the primary media type for this artwork',
      mediaUrl: 'Direct URL to the media file',
      coverImageUrl: 'URL to a cover image or thumbnail',
      language1: 'Primary language of the artwork',
      language2: 'Secondary language (if multilingual)',
      language3: 'Third language (if multilingual)',
      location1: 'City or primary location',
      location2: 'Country or secondary location',
      url1: 'Primary external URL',
      url2: 'Secondary external URL',
      url3: 'Additional external URL'
    };
    
    return helpTexts[field] || '';
   }, [formData.medium]);

  // Get smart suggestions for field values
   const getSmartSuggestions = useCallback((field: keyof ArtworkFormData): string[] => {
     const suggestions: Record<string, string[]> = {
       mediaType: formData.medium === 'audio' 
         ? ['audio', 'video', 'text'] 
         : ['image', 'video', 'text'],
       language1: ['nl', 'en', 'de', 'fr'],
       tags: formData.medium === 'audio' 
         ? ['instrumental', 'vocal', 'electronic', 'acoustic', 'experimental']
         : ['abstract', 'contemporary', 'classic', 'modern', 'experimental']
     };
     
     return suggestions[field] || [];
   }, [formData.medium]);

  // Get field priority for focus management
   const getFieldPriority = useCallback((field: keyof ArtworkFormData): number => {
     const priorities: Record<string, number> = {
       title: 1,
       medium: 2,
       year: 3,
       description: 4,
       content: 5,
       lyrics: 6,
       mediaUrl: 7,
       tags: 8
     };
     
     return priorities[field] || 99;
   }, []);

  // Get next suggested field to focus
  const getNextSuggestedField = useCallback((): keyof ArtworkFormData | null => {
    const visibleFields = smartState.visibleFields;
    const requiredFields = smartState.requiredFields;
    
    // Find first empty required field
    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return field;
      }
    }
    
    // Find first empty optional field by priority
    const sortedFields = visibleFields
      .filter(field => !requiredFields.includes(field))
      .sort((a, b) => getFieldPriority(a) - getFieldPriority(b));
    
    for (const field of sortedFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return field;
      }
    }
    
    return null;
  }, [smartState.visibleFields, smartState.requiredFields, formData, getFieldPriority]);

  return {
    smartState,
    shouldShowField: (field: keyof ArtworkFormData) => shouldShowField(field, formData),
    isFieldRequired: (field: keyof ArtworkFormData) => isFieldRequired(field, formData),
    applySmartDefaultsForCategory,
    applyFieldDependencies,
    shouldAnimateField,
    getContextualHelpText,
    getSmartSuggestions,
    getFieldPriority,
    getNextSuggestedField
  };
};
