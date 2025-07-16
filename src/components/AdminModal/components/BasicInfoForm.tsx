// src/components/AdminModal/components/BasicInfoForm.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\BasicInfoForm.tsx
import React from 'react';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants';
import { FormComponentProps } from '../types';
import {
  SectionTitle,
  FieldGroup,
  Label,
  Input,
  Select,
  Textarea,
  CheckboxGroup,
  Checkbox,
  ErrorMessage
} from '../styles';
import { SmartFormField } from './SmartFormField';

export const BasicInfoForm: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField,
  isFieldLoading
}) => {
  return (
    <>
      <SectionTitle>Basisinformatie</SectionTitle>
      
      <SmartFormField
        label="Titel"
        field="title"
        value={formData.title}
        formData={formData}
        onChange={updateField}
        placeholder="Titel van het kunstwerk"
        required
        maxLength={100}
        loading={isFieldLoading?.('title')}
        showProgress
      />

      <FieldGroup>
        <Label htmlFor="category">Categorie *</Label>
        <Select
          id="category"
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
          aria-invalid={!!errors.category}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </Select>
        {errors.category && (
          <ErrorMessage>{errors.category}</ErrorMessage>
        )}
      </FieldGroup>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <SmartFormField
            label="Jaar"
            field="year"
            value={formData.year}
            formData={formData}
            onChange={updateField}
            placeholder="2024"
            type="number"
            min={1900}
            max={new Date().getFullYear() + 1}
            required
            loading={isFieldLoading?.('year')}
          />
        </div>

        <FieldGroup style={{ flex: 1 }}>
          <Label htmlFor="month">Maand</Label>
          <Input
            id="month"
            type="number"
            value={formData.month || ''}
            onChange={(e) => updateField('month', parseInt(e.target.value) || null)}
            placeholder="12"
            min="1"
            max="12"
          />
        </FieldGroup>

        <FieldGroup style={{ flex: 1 }}>
          <Label htmlFor="day">Dag</Label>
          <Input
            id="day"
            type="number"
            value={formData.day || ''}
            onChange={(e) => updateField('day', parseInt(e.target.value) || null)}
            placeholder="25"
            min="1"
            max="31"
          />
        </FieldGroup>
      </div>

      <SmartFormField
        label="Beschrijving"
        field="description"
        value={formData.description || ''}
        formData={formData}
        onChange={updateField}
        placeholder="Korte beschrijving van het kunstwerk"
        type="textarea"
        rows={3}
        maxLength={500}
        loading={isFieldLoading?.('description')}
        showProgress
      />

      <SmartFormField
        label="Inhoud"
        field="content"
        value={formData.content || ''}
        formData={formData}
        onChange={updateField}
        placeholder="Volledige inhoud van het kunstwerk"
        type="richtext"
        maxLength={5000}
        loading={isFieldLoading?.('content')}
        showProgress
        helpText="Gebruik markdown syntax voor opmaak (bijv. **bold**, *italic*, # heading)"
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