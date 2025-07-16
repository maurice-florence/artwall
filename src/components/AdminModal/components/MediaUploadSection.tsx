// src/components/AdminModal/components/MediaUploadSection.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MediaUploadSection.tsx
import React from 'react';
import { ArtworkFormData } from '@/types';
import { FormComponentProps } from '../types';
import { SmartFormField } from './SmartFormField';
import {
  SectionTitle,
  FieldGroup,
  Label,
  ErrorMessage
} from '../styles';

export const MediaUploadSection: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField,
  isFieldLoading,
  shouldShowField,
  isFieldRequired,
  shouldAnimateField,
  getContextualHelpText,
  getSmartSuggestions
}) => {
  return (
    <>
      <SectionTitle>Media Upload</SectionTitle>
      
      {shouldShowField?.('mediaUrl') && (
        <SmartFormField
          label="Media URL"
          field="mediaUrl"
          value={formData.mediaUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Direct link naar media bestand"
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('mediaUrl')}
          helpText={getContextualHelpText?.('mediaUrl') || "Directe link naar het media bestand"}
          required={isFieldRequired?.('mediaUrl')}
          animate={shouldAnimateField?.('mediaUrl')}
        />
      )}

      {shouldShowField?.('coverImageUrl') && (
        <SmartFormField
          label="Cover Afbeelding URL"
          field="coverImageUrl"
          value={formData.coverImageUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Direct link naar cover afbeelding"
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('coverImageUrl')}
          helpText={getContextualHelpText?.('coverImageUrl') || "Cover afbeelding voor het kunstwerk"}
          required={isFieldRequired?.('coverImageUrl')}
          animate={shouldAnimateField?.('coverImageUrl')}
        />
      )}

      {shouldShowField?.('pdfUrl') && (
        <SmartFormField
          label="PDF URL"
          field="pdfUrl"
          value={formData.pdfUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Direct link naar PDF bestand"
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('pdfUrl')}
          helpText={getContextualHelpText?.('pdfUrl') || "PDF versie van het kunstwerk"}
          required={isFieldRequired?.('pdfUrl')}
          animate={shouldAnimateField?.('pdfUrl')}
        />
      )}

      {shouldShowField?.('audioUrl') && (
        <SmartFormField
          label="Audio URL"
          field="audioUrl"
          value={formData.audioUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Direct link naar audio bestand"
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('audioUrl')}
          helpText={getContextualHelpText?.('audioUrl') || "Audio versie van het kunstwerk"}
          required={isFieldRequired?.('audioUrl')}
          animate={shouldAnimateField?.('audioUrl')}
        />
      )}

      {shouldShowField?.('mediaUrls') && (
        <SmartFormField
          label="Meerdere Media URLs"
          field="mediaUrls"
          value={Array.isArray(formData.mediaUrls) ? formData.mediaUrls : []}
          formData={formData}
          onChange={updateField}
          placeholder="Voeg media URLs toe..."
          type="multiselect"
          loading={isFieldLoading?.('mediaUrls')}
          helpText={getContextualHelpText?.('mediaUrls') || "Meerdere media bestanden voor dit kunstwerk"}
          required={isFieldRequired?.('mediaUrls')}
          animate={shouldAnimateField?.('mediaUrls')}
        />
      )}
    </>
  );
};