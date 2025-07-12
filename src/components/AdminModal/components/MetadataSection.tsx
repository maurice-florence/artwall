// src/components/AdminModal/components/MetadataSection.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MetadataSection.tsx
import React from 'react';
import { ArtworkFormData } from '@/types';
import {
  SectionTitle,
  FieldGroup,
  Label,
  Input,
  Select,
  CheckboxGroup,
  Checkbox,
  ErrorMessage
} from '../styles';

// Temporary inline type definition
interface FormComponentProps {
  formData: ArtworkFormData;
  errors: { [key: string]: string };
  updateField: (field: keyof ArtworkFormData, value: any) => void;
}

export const MetadataSection: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField
}) => {
  return (
    <>
      <SectionTitle>Metadata</SectionTitle>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <FieldGroup style={{ flex: 1 }}>
          <Label htmlFor="version">Versie</Label>
          <Input
            id="version"
            type="text"
            value={formData.version || '01'}
            onChange={(e) => updateField('version', e.target.value)}
            placeholder="01"
          />
        </FieldGroup>
        
        <FieldGroup style={{ flex: 1 }}>
          <Label htmlFor="language">Taal</Label>
          <Select
            id="language"
            value={formData.language || 'nl'}
            onChange={(e) => updateField('language', e.target.value)}
          >
            <option value="nl">Nederlands</option>
            <option value="en">Engels</option>
            <option value="fr">Frans</option>
            <option value="de">Duits</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="tags">Tags (komma gescheiden)</Label>
        <Input
          id="tags"
          type="text"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
          onChange={(e) => {
            const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            updateField('tags', tagsArray);
          }}
          placeholder="tag1, tag2, tag3"
        />
      </FieldGroup>

      <CheckboxGroup>
        <Checkbox
          id="isHidden"
          checked={formData.isHidden || false}
          onChange={(e) => updateField('isHidden', e.target.checked)}
        />
        <Label htmlFor="isHidden">Verborgen (niet zichtbaar op de website)</Label>
      </CheckboxGroup>
    </>
  );
};