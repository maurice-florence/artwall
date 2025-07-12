// src/components/AdminModal/components/MetadataForm.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MetadataForm.tsx
import React from 'react';
import { ArtworkFormData } from '../types';
import { SectionTitle, FieldGroup, Label, Input, Select } from '../styles';

interface MetadataFormProps {
  formData: ArtworkFormData;
  onUpdateField: <K extends keyof ArtworkFormData>(field: K, value: ArtworkFormData[K]) => void;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({
  formData,
  onUpdateField
}) => {
  return (
    <>
      <SectionTitle>Metadata</SectionTitle>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <FieldGroup style={{ flex: 1 }}>
          <Label>Versie</Label>
          <Input 
            value={formData.version} 
            onChange={e => onUpdateField('version', e.target.value)} 
            placeholder="01"
          />
        </FieldGroup>
        
        <FieldGroup style={{ flex: 1 }}>
          <Label>Taal</Label>
          <Select 
            value={formData.language} 
            onChange={e => onUpdateField('language', e.target.value)}
          >
            <option value="en">Engels</option>
            <option value="nl">Nederlands</option>
          </Select>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label>Tags (komma gescheiden)</Label>
        <Input 
          value={formData.tags} 
          onChange={e => onUpdateField('tags', e.target.value)} 
          placeholder="tag1, tag2, tag3"
        />
      </FieldGroup>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <FieldGroup style={{ flex: 1 }}>
          <Label>Locatie 1</Label>
          <Input 
            value={formData.location1} 
            onChange={e => onUpdateField('location1', e.target.value)} 
            placeholder="Stad"
          />
        </FieldGroup>
        
        <FieldGroup style={{ flex: 1 }}>
          <Label>Locatie 2</Label>
          <Input 
            value={formData.location2} 
            onChange={e => onUpdateField('location2', e.target.value)} 
            placeholder="Land"
          />
        </FieldGroup>
      </div>
    </>
  );
};