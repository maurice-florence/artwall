// src/components/AdminModal/components/Phase3BDemo.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\Phase3BDemo.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { SmartFormField } from './SmartFormField';
import { MultiSelectField } from './MultiSelectField';
import { URLPreviewField } from './URLPreviewField';
import { ColorPickerField } from './ColorPickerField';
import { RichTextEditor } from './RichTextEditor';
import { DatePicker } from './DatePicker';
import { FileUpload } from './FileUpload';
import { ArtworkFormData } from '@/types';

const DemoContainer = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const DemoTitle = styled.h2`
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
`;

const DemoSubtitle = styled.p`
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
  margin-bottom: 32px;
  font-size: 16px;
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  margin: 32px 0 16px 0;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid ${({ theme }) => theme.accent || '#E07A5F'};
  padding-bottom: 8px;
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
`;

const DataPreview = styled.pre`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  overflow-x: auto;
  margin-top: 24px;
  border: 1px solid #e0e0e0;
  color: #333;
`;

export const Phase3BDemo: React.FC = () => {
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: 'Phase 3B Demo',
    year: new Date().getFullYear(),
    month: undefined,
    day: undefined,
    medium: 'audio',
    subtype: 'vocal',
    description: '',
    content: '',
    isHidden: false,
    version: '01',
    language1: 'nl',
    tags: ['demo', 'phase3b'],
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
    language2: '',
    language3: '',
    url1: '',
    url2: '',
    url3: '',
    testColor: '#E07A5F',
    testMultiSelect: ['option1', 'option3'],
    testRichText: '# Welcome to Phase 3B\n\nThis is a **rich text** editor with *markdown* support.\n\n- Feature 1\n- Feature 2\n- Feature 3',
    testUrl: 'https://example.com/demo-image.jpg',
    testFile: null,
    testDate: { year: 2024, month: 12, day: 15 }
  });

  const handleFieldChange = (field: keyof ArtworkFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const multiSelectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' }
  ];

  return (
    <DemoContainer>
      <DemoTitle>Phase 3B: Advanced Field Types Demo</DemoTitle>
      <DemoSubtitle>
        Deze demo showcaset alle nieuwe geavanceerde veldtypen die in Phase 3B zijn geïmplementeerd.
      </DemoSubtitle>

      <SectionTitle>🎨 Color Picker</SectionTitle>
      <SmartFormField
        label="Kleur"
        field="testColor"
        value={formData.testColor || '#E07A5F'}
        formData={formData}
        onChange={handleFieldChange}
        type="color"
        helpText="Kies een kleur uit de presets of gebruik een custom kleur"
      />

      <SectionTitle>🎯 Multi-Select</SectionTitle>
      <SmartFormField
        label="Opties"
        field="testMultiSelect"
        value={formData.testMultiSelect || []}
        formData={formData}
        onChange={handleFieldChange}
        type="multiselect"
        options={multiSelectOptions}
        multiple={true}
        helpText="Selecteer meerdere opties uit de lijst"
      />

      <SectionTitle>📝 Rich Text Editor</SectionTitle>
      <SmartFormField
        label="Inhoud"
        field="testRichText"
        value={formData.testRichText || ''}
        formData={formData}
        onChange={handleFieldChange}
        type="richtext"
        maxLength={2000}
        helpText="Gebruik markdown syntax voor opmaak"
      />

      <SectionTitle>🔗 URL with Preview</SectionTitle>
      <SectionTitle>🎨 Color Picker</SectionTitle>
      <ColorPickerField
        label="Theme Color"
        value={formData.testColor || '#E07A5F'}
        onChange={(value) => handleFieldChange('testColor', value)}
        required
        helpText="Choose your theme color with presets or custom values"
      />

      <SectionTitle>🔗 URL Preview</SectionTitle>
      <URLPreviewField
        label="Media URL"
        value={formData.testUrl || ''}
        onChange={(value) => handleFieldChange('testUrl', value)}
        placeholder="https://example.com/image.jpg"
        showPreview={true}
        helpText="Enter a URL to see automatic preview generation"
      />

      <SectionTitle>📝 Rich Text Editor</SectionTitle>
      <FullWidthField>
        <RichTextEditor
          label="Content"
          value={formData.testRichText || ''}
          onChange={(value) => handleFieldChange('testRichText', value)}
          placeholder="Start typing with markdown support..."
          maxLength={1000}
          helpText="Use markdown syntax for formatting"
        />
      </FullWidthField>

      <SectionTitle>📅 Date Picker</SectionTitle>
      <DatePicker
        label="Publication Date"
        value={formData.testDate || {}}
        onChange={(value) => handleFieldChange('testDate', value)}
        required
        helpText="Select a structured date"
      />

      <SectionTitle>🎯 Multi-Select Field</SectionTitle>
      <MultiSelectField
        label="Categories"
        value={Array.isArray(formData.testMultiSelect) ? formData.testMultiSelect : []}
        onChange={(value) => handleFieldChange('testMultiSelect', value)}
        options={multiSelectOptions}
        searchable={true}
        placeholder="Select multiple options..."
        helpText="Search and select multiple options"
      />

      <SectionTitle>📁 File Upload</SectionTitle>
      <FileUpload
        label="Upload File"
        value={formData.testFile as File | null}
        onFileSelect={(files: File[]) => handleFieldChange('testFile', files[0] || null)}
        accept="image/*,audio/*,video/*"
        multiple={false}
        helpText="Drag and drop or click to upload"
      />

      <SectionTitle>� SmartFormField Integration</SectionTitle>
      <FieldsGrid>
        <SmartFormField
          label="Rich Text via SmartFormField"
          field="content"
          value={formData.content || ''}
          formData={formData}
          onChange={handleFieldChange}
          type="richtext"
          placeholder="Rich text through SmartFormField..."
          helpText="Rich text editor integrated through SmartFormField"
        />

        <SmartFormField
          label="Color via SmartFormField"
          field="testColor"
          value={formData.testColor || '#000000'}
          formData={formData}
          onChange={handleFieldChange}
          type="color"
          helpText="Color picker integrated through SmartFormField"
        />

        <SmartFormField
          label="URL via SmartFormField"
          field="mediaUrl"
          value={formData.mediaUrl || ''}
          formData={formData}
          onChange={handleFieldChange}
          type="url"
          previewUrl={true}
          placeholder="https://example.com/media"
          helpText="URL preview integrated through SmartFormField"
        />

        <SmartFormField
          label="Multi-Select via SmartFormField"
          field="testMultiSelect"
          value={formData.testMultiSelect || []}
          formData={formData}
          onChange={handleFieldChange}
          type="multiselect"
          options={multiSelectOptions}
          multiple={true}
          helpText="Multi-select integrated through SmartFormField"
        />
      </FieldsGrid>

      <SectionTitle>📊 Form Data Preview</SectionTitle>

      <DataPreview>
        {JSON.stringify(formData, null, 2)}
      </DataPreview>
    </DemoContainer>
  );
};

export default Phase3BDemo;
