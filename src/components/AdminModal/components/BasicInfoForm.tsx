// src/components/AdminModal/components/BasicInfoForm.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\BasicInfoForm.tsx
import React from 'react';
import { MEDIUMS, MEDIUM_LABELS, getSubtypesForMedium, SUBTYPE_LABELS } from '@/constants/medium';
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
import { ValidationMessage } from './ValidationMessage';
import { SmartFormField } from './SmartFormField';
import styled from 'styled-components';

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const FlexItem = styled.div`
  flex: 1;
`;

export const BasicInfoForm: React.FC<FormComponentProps> = ({
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
      <SectionTitle>Basisinformatie</SectionTitle>
      
      <SmartFormField
        label="Titel"
        field="title"
        value={formData.title}
        formData={formData}
        onChange={updateField}
        placeholder="Titel van het kunstwerk"
        required={isFieldRequired?.('title')}
        maxLength={100}
        loading={isFieldLoading?.('title')}
        showProgress
        helpText={getContextualHelpText?.('title')}
        suggestions={getSmartSuggestions?.('title')}
        animate={shouldAnimateField?.('title')}
        inputProps={{ id: 'title', 'aria-label': 'Titel' }}
      />
      {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
      {formData.title && formData.title.length < 3 && !errors.title && (
        <ValidationMessage type="warning" message="Titel is erg kort, overweeg een beschrijvendere titel" />
      )}

      <FieldGroup>
        <Label htmlFor="medium">Medium *</Label>
        <Select
          id="medium"
          value={formData.medium}
          onChange={(e) => updateField('medium', e.target.value)}
          aria-invalid={!!errors.medium}
          aria-label="Medium *"
        >
          {MEDIUMS.map((medium) => (
            <option key={medium} value={medium}>
              {MEDIUM_LABELS[medium]}
            </option>
          ))}
        </Select>
        {errors.medium && <ErrorMessage>{errors.medium}</ErrorMessage>}
      </FieldGroup>

      {shouldShowField?.('subtype') && (
        <FieldGroup>
          <Label htmlFor="subtype">Subtype</Label>
          <Select
            id="subtype"
            value={formData.subtype || ''}
            onChange={(e) => updateField('subtype', e.target.value)}
            aria-invalid={!!errors.subtype}
            aria-label="Subtype"
          >
            <option value="">Selecteer...</option>
            {getSubtypesForMedium(formData.medium).map((subtype) => (
              <option key={subtype} value={subtype}>
                {SUBTYPE_LABELS[subtype]}
              </option>
            ))}
          </Select>
          {errors.subtype && <ErrorMessage>{errors.subtype}</ErrorMessage>}
        </FieldGroup>
      )}

      <FlexRow>
        <FlexItem>
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
            inputProps={{ id: 'year', 'aria-label': 'Jaar' }}
          />
        </FlexItem>
        <FieldGroup as={FlexItem}>
          <Label htmlFor="month">Maand</Label>
          <Input
            id="month"
            type="number"
            value={formData.month || ''}
            onChange={(e) => updateField('month', parseInt(e.target.value) || null)}
            placeholder="12"
            min="1"
            max="12"
            aria-label="Maand"
          />
        </FieldGroup>
        <FieldGroup as={FlexItem}>
          <Label htmlFor="day">Dag</Label>
          <Input
            id="day"
            type="number"
            value={formData.day || ''}
            onChange={(e) => updateField('day', parseInt(e.target.value) || null)}
            placeholder="25"
            min="1"
            max="31"
            aria-label="Dag"
          />
        </FieldGroup>
      </FlexRow>

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
        helpText={getContextualHelpText?.('description') || "Korte beschrijving van het kunstwerk"}
        required={isFieldRequired?.('description')}
        animate={shouldAnimateField?.('description')}
      />

      {shouldShowField?.('content') && (
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
          helpText={getContextualHelpText?.('content') || "Gebruik markdown syntax voor opmaak (bijv. **bold**, *italic*, # heading)"}
          required={isFieldRequired?.('content')}
          animate={shouldAnimateField?.('content')}
        />
      )}

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