// src/components/AdminModal/components/CategorySpecificFields.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\CategorySpecificFields.tsx
import React from 'react';
import { FormComponentProps } from '../types';
import {
  SectionTitle,
  FieldGroup,
  Label,
  Input,
  Textarea,
  Select,
  ErrorMessage
} from '../styles';

export const CategorySpecificFields: React.FC<FormComponentProps> = ({
  formData,
  errors,
  updateField
}) => {
  const renderMusicFields = () => (
    <>
      <FieldGroup>
        <Label htmlFor="lyrics">Tekst</Label>
        <Textarea
          id="lyrics"
          value={formData.lyrics || ''}
          onChange={(e) => updateField('lyrics', e.target.value)}
          placeholder="Songtekst"
          rows={6}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="chords">Akkoorden</Label>
        <Textarea
          id="chords"
          value={formData.chords || ''}
          onChange={(e) => updateField('chords', e.target.value)}
          placeholder="Akkoorden notatie"
          rows={4}
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="soundcloudEmbedUrl">SoundCloud Embed URL</Label>
        <Input
          id="soundcloudEmbedUrl"
          type="url"
          value={formData.soundcloudEmbedUrl || ''}
          onChange={(e) => updateField('soundcloudEmbedUrl', e.target.value)}
          placeholder="https://w.soundcloud.com/player/?url=..."
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="soundcloudTrackUrl">SoundCloud Track URL</Label>
        <Input
          id="soundcloudTrackUrl"
          type="url"
          value={formData.soundcloudTrackUrl || ''}
          onChange={(e) => updateField('soundcloudTrackUrl', e.target.value)}
          placeholder="https://soundcloud.com/..."
        />
      </FieldGroup>
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

      <FieldGroup>
        <Label htmlFor="mediaUrl">Media URL</Label>
        <Input
          id="mediaUrl"
          type="url"
          value={formData.mediaUrl || ''}
          onChange={(e) => updateField('mediaUrl', e.target.value)}
          placeholder="URL naar het media bestand"
        />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="mediaUrls">Extra Media URLs</Label>
        <Textarea
          id="mediaUrls"
          value={formData.mediaUrls || ''}
          onChange={(e) => updateField('mediaUrls', e.target.value)}
          placeholder="Een URL per regel"
          rows={3}
        />
      </FieldGroup>
    </>
  );

  if (!formData.category) return null;

  return (
    <>
      <SectionTitle>Categorie-specifieke Velden</SectionTitle>
      
      {formData.category === 'music' && renderMusicFields()}
      {['image', 'video', 'sculpture', 'drawing'].includes(formData.category) && renderMediaFields()}
      
      {formData.category === 'other' && (
        <FieldGroup>
          <Label htmlFor="mediaType">Type</Label>
          <Input
            id="mediaType"
            type="text"
            value={formData.mediaType || ''}
            onChange={(e) => updateField('mediaType', e.target.value)}
            placeholder="Specificeer het type kunstwerk"
          />
        </FieldGroup>
      )}
    </>
  );
};