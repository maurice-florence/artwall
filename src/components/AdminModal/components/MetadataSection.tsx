// src/components/AdminModal/components/MetadataSection.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MetadataSection.tsx
import React from 'react';
import { ArtworkFormData } from '@/types';
import { FormComponentProps } from '../types';
import { SmartFormField } from './SmartFormField';
import {
  SectionTitle,
  FieldGroup,
  Label,
  Select,
  CheckboxGroup,
  Checkbox,
  ErrorMessage
} from '../styles';

export const MetadataSection: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField,
  isFieldLoading
}) => {
  return (
    <>
      <SectionTitle>Metadata</SectionTitle>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <SmartFormField
          label="Versie"
          field="version"
          value={formData.version || '01'}
          formData={formData}
          onChange={updateField}
          placeholder="01"
          type="text"
          maxLength={10}
          loading={isFieldLoading?.('version')}
          helpText="Versie van het kunstwerk"
        />
        
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

      <SmartFormField
        label="Tags"
        field="tags"
        value={Array.isArray(formData.tags) ? formData.tags : []}
        formData={formData}
        onChange={updateField}
        placeholder="Voeg tags toe..."
        type="tags"
        loading={isFieldLoading?.('tags')}
        helpText="Voeg tags toe door te typen en Enter te drukken"
      />

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