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
  isFieldLoading,
  shouldShowField,
  isFieldRequired,
  shouldAnimateField,
  getContextualHelpText,
  getSmartSuggestions
}) => {
  return (
    <>
      <SectionTitle>Metadata</SectionTitle>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        {shouldShowField?.('version') && (
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
            helpText={getContextualHelpText?.('version') || "Versie van het kunstwerk"}
            required={isFieldRequired?.('version')}
            animate={shouldAnimateField?.('version')}
          />
        )}
        
        {shouldShowField?.('language1') && (
          <SmartFormField
            label="Primaire Taal"
            field="language1"
            value={formData.language1 || 'nl'}
            formData={formData}
            onChange={updateField}
            placeholder="Selecteer taal"
            type="select"
            options={[
              { value: 'nl', label: 'Nederlands' },
              { value: 'en', label: 'Engels' },
              { value: 'fr', label: 'Frans' },
              { value: 'de', label: 'Duits' }
            ]}
            loading={isFieldLoading?.('language1')}
            helpText={getContextualHelpText?.('language1')}
            required={isFieldRequired?.('language1')}
            animate={shouldAnimateField?.('language1')}
            suggestions={getSmartSuggestions?.('language1')}
          />
        )}
      </div>

      {shouldShowField?.('language2') && (
        <SmartFormField
          label="Secundaire Taal"
          field="language2"
          value={formData.language2 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Selecteer tweede taal"
          type="select"
          options={[
            { value: '', label: 'Geen' },
            { value: 'nl', label: 'Nederlands' },
            { value: 'en', label: 'Engels' },
            { value: 'fr', label: 'Frans' },
            { value: 'de', label: 'Duits' }
          ]}
          loading={isFieldLoading?.('language2')}
          helpText={getContextualHelpText?.('language2')}
          required={isFieldRequired?.('language2')}
          animate={shouldAnimateField?.('language2')}
        />
      )}

      {shouldShowField?.('language3') && (
        <SmartFormField
          label="Derde Taal"
          field="language3"
          value={formData.language3 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Selecteer derde taal"
          type="select"
          options={[
            { value: '', label: 'Geen' },
            { value: 'nl', label: 'Nederlands' },
            { value: 'en', label: 'Engels' },
            { value: 'fr', label: 'Frans' },
            { value: 'de', label: 'Duits' }
          ]}
          loading={isFieldLoading?.('language3')}
          helpText={getContextualHelpText?.('language3')}
          required={isFieldRequired?.('language3')}
          animate={shouldAnimateField?.('language3')}
        />
      )}

      {shouldShowField?.('location1') && (
        <SmartFormField
          label="Locatie"
          field="location1"
          value={formData.location1 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Stad, land"
          type="text"
          maxLength={100}
          loading={isFieldLoading?.('location1')}
          helpText={getContextualHelpText?.('location1')}
          required={isFieldRequired?.('location1')}
          animate={shouldAnimateField?.('location1')}
        />
      )}

      {shouldShowField?.('location2') && (
        <SmartFormField
          label="Tweede Locatie"
          field="location2"
          value={formData.location2 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Aanvullende locatie"
          type="text"
          maxLength={100}
          loading={isFieldLoading?.('location2')}
          helpText={getContextualHelpText?.('location2')}
          required={isFieldRequired?.('location2')}
          animate={shouldAnimateField?.('location2')}
        />
      )}

      {shouldShowField?.('url1') && (
        <SmartFormField
          label="URL 1"
          field="url1"
          value={formData.url1 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="https://..."
          type="url"
          loading={isFieldLoading?.('url1')}
          helpText={getContextualHelpText?.('url1')}
          required={isFieldRequired?.('url1')}
          animate={shouldAnimateField?.('url1')}
          previewUrl={true}
        />
      )}

      {shouldShowField?.('url2') && (
        <SmartFormField
          label="URL 2"
          field="url2"
          value={formData.url2 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="https://..."
          type="url"
          loading={isFieldLoading?.('url2')}
          helpText={getContextualHelpText?.('url2')}
          required={isFieldRequired?.('url2')}
          animate={shouldAnimateField?.('url2')}
          previewUrl={true}
        />
      )}

      {shouldShowField?.('url3') && (
        <SmartFormField
          label="URL 3"
          field="url3"
          value={formData.url3 || ''}
          formData={formData}
          onChange={updateField}
          placeholder="https://..."
          type="url"
          loading={isFieldLoading?.('url3')}
          helpText={getContextualHelpText?.('url3')}
          required={isFieldRequired?.('url3')}
          animate={shouldAnimateField?.('url3')}
          previewUrl={true}
        />
      )}

      {shouldShowField?.('tags') && (
        <SmartFormField
          label="Tags"
          field="tags"
          value={Array.isArray(formData.tags) ? formData.tags : []}
          formData={formData}
          onChange={updateField}
          placeholder="Voeg tags toe..."
          type="tags"
          loading={isFieldLoading?.('tags')}
          helpText={getContextualHelpText?.('tags') || "Voeg tags toe door te typen en Enter te drukken"}
          required={isFieldRequired?.('tags')}
          animate={shouldAnimateField?.('tags')}
          suggestions={getSmartSuggestions?.('tags')}
        />
      )}

      {shouldShowField?.('evaluation') && (
        <SmartFormField
          label="Evaluatie (1-5)"
          field="evaluation"
          value={formData.evaluation || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Selecteer score"
          type="select"
          options={[
            { value: '', label: 'Geen' },
            { value: '1', label: '1 - Slecht' },
            { value: '2', label: '2 - Matig' },
            { value: '3', label: '3 - Goed' },
            { value: '4', label: '4 - Zeer goed' },
            { value: '5', label: '5 - Uitstekend' }
          ]}
          loading={isFieldLoading?.('evaluation')}
          helpText={getContextualHelpText?.('evaluation') || "Jouw persoonlijke beoordeling van dit werk"}
          required={isFieldRequired?.('evaluation')}
          animate={shouldAnimateField?.('evaluation')}
        />
      )}

      {shouldShowField?.('rating') && (
        <SmartFormField
          label="Publieke Rating"
          field="rating"
          value={formData.rating || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Externe beoordeling"
          type="text"
          maxLength={10}
          loading={isFieldLoading?.('rating')}
          helpText={getContextualHelpText?.('rating') || "Externe of publieke beoordeling"}
          required={isFieldRequired?.('rating')}
          animate={shouldAnimateField?.('rating')}
        />
      )}

      {shouldShowField?.('isHidden') && (
        <CheckboxGroup>
          <Checkbox
            id="isHidden"
            checked={formData.isHidden || false}
            onChange={(e) => updateField('isHidden', e.target.checked)}
          />
          <Label htmlFor="isHidden">Verborgen (niet zichtbaar op de website)</Label>
        </CheckboxGroup>
      )}
    </>
  );
};