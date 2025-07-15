// src/components/AdminModal/components/SmartFormFieldTest.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\SmartFormFieldTest.tsx
import React, { useState } from 'react';
import { SmartFormField } from './SmartFormField';
import { ArtworkFormData } from '@/types';

// Simple test component to verify SmartFormField works
export const SmartFormFieldTest: React.FC = () => {
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    year: new Date().getFullYear(),
    month: undefined,
    day: undefined,
    category: 'poetry',
    description: '',
    content: '',
    isHidden: false,
    version: '01',
    language: 'nl',
    tags: [],
    lyrics: '',
    chords: '',
    soundcloudEmbedUrl: '',
    soundcloudTrackUrl: '',
    mediaType: 'text',
    coverImageUrl: '',
    audioUrl: '',
    pdfUrl: '',
    mediaUrl: '',
    mediaUrls: [],
    location1: '',
    location2: '',
    language1: '',
    language2: '',
    language3: '',
    url1: '',
    url2: '',
    url3: ''
  });

  const handleFieldChange = (field: keyof ArtworkFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>SmartFormField Test</h3>
      
      <SmartFormField
        label="Titel"
        field="title"
        value={formData.title}
        formData={formData}
        onChange={handleFieldChange}
        type="text"
        placeholder="Voer een titel in..."
        required
        maxLength={200}
        helpText="Dit is de titel van je kunstwerk"
      />
      
      <SmartFormField
        label="Jaar"
        field="year"
        value={formData.year}
        formData={formData}
        onChange={handleFieldChange}
        type="number"
        required
        min={1900}
        max={new Date().getFullYear() + 1}
        helpText="Het jaar waarin dit kunstwerk is gemaakt"
      />
      
      <SmartFormField
        label="Beschrijving"
        field="description"
        value={formData.description}
        formData={formData}
        onChange={handleFieldChange}
        type="textarea"
        placeholder="Beschrijf je kunstwerk..."
        maxLength={500}
        rows={4}
        helpText="Een korte beschrijving van het kunstwerk"
      />
      
      <SmartFormField
        label="Categorie"
        field="category"
        value={formData.category}
        formData={formData}
        onChange={handleFieldChange}
        type="select"
        required
        options={[
          { value: 'poetry', label: 'Poëzie' },
          { value: 'prose', label: 'Proza' },
          { value: 'music', label: 'Muziek' },
          { value: 'art', label: 'Kunst' }
        ]}
        helpText="Selecteer de categorie van je kunstwerk"
      />
      
      <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '20px' }}>
        {JSON.stringify(formData, null, 2)}
      </pre>
    </div>
  );
};

export default SmartFormFieldTest;