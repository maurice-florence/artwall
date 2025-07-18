// src/components/AdminModal/components/CategorySpecificFields.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\CategorySpecificFields.tsx
import React from 'react';
import { ArtworkFormData } from '@/types';
import { FormComponentProps } from '../types';
import { SmartFormField } from './SmartFormField';
import {
  SectionTitle,
  FieldGroup,
  Label,
  Select,
  ErrorMessage
} from '../styles';

export const MediumSpecificFields: React.FC<FormComponentProps> = ({
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
  const renderMusicFields = () => (
    <>
      {shouldShowField?.('lyrics') && (
        <SmartFormField
          label="Tekst"
          field="lyrics"
          value={formData.lyrics || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Songtekst"
          type="richtext"
          maxLength={2000}
          loading={isFieldLoading?.('lyrics')}
          helpText={getContextualHelpText?.('lyrics')}
          required={isFieldRequired?.('lyrics')}
          animate={shouldAnimateField?.('lyrics')}
        />
      )}

      {shouldShowField?.('chords') && (
        <SmartFormField
          label="Akkoorden"
          field="chords"
          value={formData.chords || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Akkoorden notatie"
          type="textarea"
          rows={4}
          maxLength={1000}
          loading={isFieldLoading?.('chords')}
          helpText={getContextualHelpText?.('chords')}
          required={isFieldRequired?.('chords')}
          animate={shouldAnimateField?.('chords')}
        />
      )}

      {shouldShowField?.('soundcloudEmbedUrl') && (
        <SmartFormField
          label="SoundCloud Embed URL"
          field="soundcloudEmbedUrl"
          value={formData.soundcloudEmbedUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="https://w.soundcloud.com/player/?url=..."
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('soundcloudEmbedUrl')}
          helpText={getContextualHelpText?.('soundcloudEmbedUrl')}
          required={isFieldRequired?.('soundcloudEmbedUrl')}
          animate={shouldAnimateField?.('soundcloudEmbedUrl')}
        />
      )}

      {shouldShowField?.('soundcloudTrackUrl') && (
        <SmartFormField
          label="SoundCloud Track URL"
          field="soundcloudTrackUrl"
          value={formData.soundcloudTrackUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="https://soundcloud.com/..."
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('soundcloudTrackUrl')}
          helpText={getContextualHelpText?.('soundcloudTrackUrl')}
          required={isFieldRequired?.('soundcloudTrackUrl')}
          animate={shouldAnimateField?.('soundcloudTrackUrl')}
        />
      )}
    </>
  );

  const renderMediaFields = () => (
    <>
      {shouldShowField?.('mediaType') && (
        <SmartFormField
          label="Media Type"
          field="mediaType"
          value={formData.mediaType || 'text'}
          formData={formData}
          onChange={updateField}
          placeholder="Selecteer media type"
          type="select"
          options={[
            { value: 'text', label: 'Tekst' },
            { value: 'image', label: 'Afbeelding' },
            // ...existing code...
            { value: 'audio', label: 'Audio' },
            { value: 'pdf', label: 'PDF' }
          ]}
          loading={isFieldLoading?.('mediaType')}
          helpText={getContextualHelpText?.('mediaType')}
          required={isFieldRequired?.('mediaType')}
          animate={shouldAnimateField?.('mediaType')}
          suggestions={getSmartSuggestions?.('mediaType')}
        />
      )}

      {shouldShowField?.('mediaUrl') && (
        <SmartFormField
          label="Media URL"
          field="mediaUrl"
          value={formData.mediaUrl || ''}
          formData={formData}
          onChange={updateField}
          placeholder="URL naar het media bestand"
          type="url"
          previewUrl={true}
          loading={isFieldLoading?.('mediaUrl')}
          helpText={getContextualHelpText?.('mediaUrl') || "Directe link naar het media bestand"}
          required={isFieldRequired?.('mediaUrl')}
          animate={shouldAnimateField?.('mediaUrl')}
        />
      )}

      {shouldShowField?.('mediaUrls') && (
        <SmartFormField
          label="Extra Media URLs"
          field="mediaUrls"
          value={Array.isArray(formData.mediaUrls) ? formData.mediaUrls : []}
          formData={formData}
          onChange={updateField}
          placeholder="Voeg media URLs toe..."
          type="multiselect"
          loading={isFieldLoading?.('mediaUrls')}
          helpText={getContextualHelpText?.('mediaUrls') || "Meerdere media bestanden voor dit kunstwerk"}
          required={isFieldRequired?.('mediaUrls')}
          animate={shouldAnimateField?.('mediaUrls')}
        />
      )}
    </>
  );

  if (!formData.medium) return null;

  return (
    <>
      <SectionTitle>Medium-specifieke Velden</SectionTitle>
      {formData.medium === 'audio' && renderMusicFields()}
      {['drawing', 'sculpture'].includes(formData.medium) && renderMediaFields()}
      {formData.medium === 'other' && (
        <SmartFormField
          label="Type"
          field="mediaType"
          value={formData.mediaType || ''}
          formData={formData}
          onChange={updateField}
          placeholder="Specificeer het type kunstwerk"
          type="text"
          maxLength={100}
          loading={isFieldLoading?.('mediaType')}
          helpText="Beschrijf het type kunstwerk"
        />
      )}
    </>
  );
};