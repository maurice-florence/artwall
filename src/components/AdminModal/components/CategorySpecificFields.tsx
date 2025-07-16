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

export const CategorySpecificFields: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField,
  isFieldLoading
}) => {
  const renderMusicFields = () => (
    <>
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
        helpText="Gebruik markdown syntax voor opmaak van songteksten"
      />

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
        helpText="Gebruik ChordPro syntax of gewone tekst"
      />

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
        helpText="Embed URL van SoundCloud voor directe weergave"
      />

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
        helpText="Directe link naar SoundCloud track"
      />
    </>
  );

  const renderMediaFields = () => (
    <>
      <FieldGroup>
        <Label htmlFor="mediaType">Media Type</Label>
        <Select
          id="mediaType"
          value={formData.mediaType || 'text'}
          onChange={(e) => updateField('mediaType', e.target.value)}
        >
          <option value="text">Tekst</option>
          <option value="image">Afbeelding</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="pdf">PDF</option>
        </Select>
      </FieldGroup>

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
        helpText="Directe link naar het media bestand"
      />

      <SmartFormField
        label="Extra Media URLs"
        field="mediaUrls"
        value={Array.isArray(formData.mediaUrls) ? formData.mediaUrls.join('\n') : (formData.mediaUrls || '')}
        formData={formData}
        onChange={(field, value) => updateField(field, value)}
        placeholder="Een URL per regel"
        type="textarea"
        rows={3}
        maxLength={1000}
        loading={isFieldLoading?.('mediaUrls')}
        helpText="Voeg extra media URLs toe, één per regel"
      />
    </>
  );

  if (!formData.category) return null;

  return (
    <>
      <SectionTitle>Categorie-specifieke Velden</SectionTitle>
      
      {formData.category === 'music' && renderMusicFields()}
      {['image', 'video', 'sculpture', 'drawing'].includes(formData.category) && renderMediaFields()}
      
      {formData.category === 'other' && (
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