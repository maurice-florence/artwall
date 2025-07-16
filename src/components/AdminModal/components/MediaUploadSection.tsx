// src/components/AdminModal/components/MediaUploadSection.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MediaUploadSection.tsx
import React from 'react';
import { ArtworkFormData } from '@/types';
import { FormComponentProps } from '../types';
import {
  SectionTitle,
  FieldGroup,
  Label,
  Input,
  FileInput,
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
      
      <FieldGroup>
        <Label htmlFor="mediaUrl">Media URL</Label>
        <Input
          id="mediaUrl"
          type="url"
          value={formData.mediaUrl || ''}
          onChange={(e) => updateField('mediaUrl', e.target.value)}
          placeholder="Direct link naar media bestand"
        />
        {errors.mediaUrl && (
          <ErrorMessage>{errors.mediaUrl}</ErrorMessage>
        )}
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="coverImageUrl">Cover Afbeelding URL</Label>
        <Input
          id="coverImageUrl"
          type="url"
          value={formData.coverImageUrl || ''}
          onChange={(e) => updateField('coverImageUrl', e.target.value)}
          placeholder="Direct link naar cover afbeelding"
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="fileUpload">Bestand uploaden</Label>
        <FileInput
          id="fileUpload"
          accept="image/*,audio/*,video/*,.pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              updateField('uploadedFile', file);
            }
          }}
        />
      </FieldGroup>
    </>
  );
};