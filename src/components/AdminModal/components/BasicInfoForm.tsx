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

export const BasicInfoForm: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField
}) => {
  return (
    <>
      <SectionTitle>Basisinformatie</SectionTitle>
      
      <FieldGroup>
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Titel van het kunstwerk"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <ErrorMessage id="title-error">{errors.title}</ErrorMessage>
        )}
      </FieldGroup>

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
        <FieldGroup style={{ flex: 1 }}>
          <Label htmlFor="year">Jaar *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year || ''}
            onChange={(e) => updateField('year', parseInt(e.target.value) || null)}
            placeholder="2024"
            min="1900"
            max={new Date().getFullYear() + 1}
            aria-invalid={!!errors.year}
          />
          {errors.year && (
            <ErrorMessage>{errors.year}</ErrorMessage>
          )}
        </FieldGroup>

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

      <FieldGroup>
        <Label htmlFor="description">Beschrijving</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Korte beschrijving van het kunstwerk"
          rows={3}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="content">Inhoud</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Volledige inhoud van het kunstwerk"
          rows={6}
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