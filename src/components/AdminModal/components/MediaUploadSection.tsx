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
  isFieldLoading
}) => {
  return (
    <>
      <SectionTitle>Media Upload</SectionTitle>
      
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
        helpText="Directe link naar het media bestand"
      />

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
        helpText="Cover afbeelding voor het kunstwerk"
      />

      <SmartFormField
        label="Bestand uploaden"
        field="uploadedFile"
        value={formData.uploadedFile || null}
        formData={formData}
        onChange={updateField}
        type="file"
        accept="image/*,audio/*,video/*,.pdf"
        loading={isFieldLoading?.('uploadedFile')}
        helpText="Upload een bestand voor dit kunstwerk"
      />
    </>
  );
};