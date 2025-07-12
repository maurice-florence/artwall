// src/components/AdminModal/components/MediaForm.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MediaForm.tsx
import React from 'react';
import { ArtworkFormData } from '../types';
import { getCategoryFields } from '../utils/validation';
import { SectionTitle, FieldGroup, Label, Input, Textarea } from '../styles';

interface MediaFormProps {
  formData: ArtworkFormData;
  onUpdateField: <K extends keyof ArtworkFormData>(field: K, value: ArtworkFormData[K]) => void;
}

export const MediaForm: React.FC<MediaFormProps> = ({
  formData,
  onUpdateField
}) => {
  const fieldsToShow = getCategoryFields(formData.category);

  return (
    <>
      <SectionTitle>Media</SectionTitle>
      
      {fieldsToShow.includes('coverImageUrl') && (
        <FieldGroup>
          <Label>Cover Afbeelding URL</Label>
          <Input 
            value={formData.coverImageUrl} 
            onChange={e => onUpdateField('coverImageUrl', e.target.value)} 
            placeholder="Direct link naar cover afbeelding"
          />
        </FieldGroup>
      )}

      {fieldsToShow.includes('pdfUrl') && (
        <FieldGroup>
          <Label>PDF URL</Label>
          <Input 
            value={formData.pdfUrl} 
            onChange={e => onUpdateField('pdfUrl', e.target.value)} 
            placeholder="Direct link naar PDF bestand"
          />
        </FieldGroup>
      )}

      {fieldsToShow.includes('mediaUrl') && (
        <FieldGroup>
          <Label>Media URL</Label>
          <Input 
            value={formData.mediaUrl} 
            onChange={e => onUpdateField('mediaUrl', e.target.value)} 
            placeholder="Direct link naar media bestand"
          />
        </FieldGroup>
      )}

      <FieldGroup>
        <Label>Media URLs (één per regel)</Label>
        <Textarea 
          value={formData.mediaUrls} 
          onChange={e => onUpdateField('mediaUrls', e.target.value)} 
          placeholder="https://example.com/file1.jpg&#10;https://example.com/file2.mp3"
        />
      </FieldGroup>

      <SectionTitle>Extra URLs</SectionTitle>
      
      <FieldGroup>
        <Label>URL 1</Label>
        <Input 
          value={formData.url1} 
          onChange={e => onUpdateField('url1', e.target.value)} 
          placeholder="Extra URL"
        />
      </FieldGroup>
      
      <FieldGroup>
        <Label>URL 2</Label>
        <Input 
          value={formData.url2} 
          onChange={e => onUpdateField('url2', e.target.value)} 
          placeholder="Extra URL"
        />
      </FieldGroup>
      
      <FieldGroup>
        <Label>URL 3</Label>
        <Input 
          value={formData.url3} 
          onChange={e => onUpdateField('url3', e.target.value)} 
          placeholder="Extra URL"
        />
      </FieldGroup>
    </>
  );
};