// src/components/AdminModal/components/CategorySpecificForm.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\CategorySpecificForm.tsx
import React from 'react';
import { ArtworkFormData } from '../types';
import { getCategoryFields } from '../utils/validation';
import { SectionTitle, FieldGroup, Label, Input, Textarea } from '../styles';

interface CategorySpecificFormProps {
  formData: ArtworkFormData;
  onUpdateField: <K extends keyof ArtworkFormData>(field: K, value: ArtworkFormData[K]) => void;
}

export const CategorySpecificForm: React.FC<CategorySpecificFormProps> = ({
  formData,
  onUpdateField
}) => {
  const fieldsToShow = getCategoryFields(formData.category);

  return (
    <>
      {fieldsToShow.includes('content') && (
        <>
          <SectionTitle>Inhoud</SectionTitle>
          <FieldGroup>
            <Label>Content</Label>
            <Textarea 
              value={formData.content} 
              onChange={e => onUpdateField('content', e.target.value)} 
              placeholder="Volledige inhoud van het kunstwerk"
              style={{ minHeight: '200px' }}
            />
          </FieldGroup>
        </>
      )}

      {formData.category === 'music' && (
        <>
          <SectionTitle>Muziek</SectionTitle>
          <FieldGroup>
            <Label>Songtekst</Label>
            <Textarea 
              value={formData.lyrics} 
              onChange={e => onUpdateField('lyrics', e.target.value)} 
              placeholder="Songtekst"
              style={{ minHeight: '150px' }}
            />
          </FieldGroup>
          
          <FieldGroup>
            <Label>Akkoorden</Label>
            <Textarea 
              value={formData.chords} 
              onChange={e => onUpdateField('chords', e.target.value)} 
              placeholder="Akkoorden"
            />
          </FieldGroup>
          
          <FieldGroup>
            <Label>Audio URL</Label>
            <Input 
              value={formData.audioUrl} 
              onChange={e => onUpdateField('audioUrl', e.target.value)} 
              placeholder="Direct link naar audio bestand"
            />
          </FieldGroup>
        </>
      )}
    </>
  );
};