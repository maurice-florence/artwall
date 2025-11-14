// relocated from src/app/test-phase3b/page.tsx into sandbox
'use client';
import React, { useState } from 'react';
import styled from 'styled-components';
import { SmartFormField } from '@/components/AdminModal/components/SmartFormField';
import { ArtworkFormData } from '@/types';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: ${({ theme }) => theme.body || '#f8f9fa'};
  min-height: 100vh;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.text || '#333'};
  margin-bottom: 40px;
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Section = styled.div`
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.text || '#333'};
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid ${({ theme }) => theme.accent || '#E07A5F'};
  padding-bottom: 10px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const DataDisplay = styled.pre`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  font-size: 12px;
  color: #495057;
  overflow-x: auto;
  border: 1px solid #e9ecef;
  margin-top: 20px;
`;

const initialFormData: ArtworkFormData = {
  title: '',
  description: '',
  medium: 'drawing',
  subtype: 'marker',
  year: new Date().getFullYear(),
  tags: [],
  language1: '',
  testColor: '#E07A5F',
  testMultiSelect: [],
  testRichText: '',
  testUrl: '',
  testFile: null,
  testDate: {}
};

export default function Phase3BDemo() {
  const [formData, setFormData] = useState<ArtworkFormData>(initialFormData);

  const handleChange = (field: keyof ArtworkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tagOptions = [
    { value: 'abstract', label: 'Abstract' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'surreal', label: 'Surreal' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'colorful', label: 'Colorful' },
    { value: 'monochrome', label: 'Monochrome' }
  ];

  return (
    <PageContainer>
      <Title>🎨 Phase 3B: Advanced Field Types Demo</Title>
      <Section>
        <SectionTitle>📝 Rich Text Editor</SectionTitle>
        <SmartFormField
          label="Artwork Description"
          field="testRichText"
          value={formData.testRichText}
          formData={formData}
          onChange={handleChange}
          type="richtext"
          placeholder="Enter a detailed description of your artwork..."
          helpText="Use markdown syntax for formatting. Supports bold, italic, lists, and more."
          maxLength={2000}
        />
      </Section>
      <Section>
        <SectionTitle>🎯 Multi-Select Field</SectionTitle>
        <SmartFormField
          label="Artwork Tags"
          field="testMultiSelect"
          value={formData.testMultiSelect}
          formData={formData}
          onChange={handleChange}
          type="multiselect"
          options={tagOptions}
          placeholder="Select artwork tags..."
          helpText="Choose multiple tags that describe your artwork"
          required
        />
      </Section>
      <Section>
        <SectionTitle>🎨 Color Picker</SectionTitle>
        <FormRow>
          <SmartFormField
            label="Primary Color"
            field="testColor"
            value={formData.testColor || '#E07A5F'}
            formData={formData}
            onChange={handleChange}
            type="color"
            helpText="Choose the primary color of your artwork"
          />
          <SmartFormField
            label="Secondary Color"
            field="testColor"
            value={formData.testColor || '#3D5A80'}
            formData={formData}
            onChange={handleChange}
            type="color"
            helpText="Choose the secondary color of your artwork"
          />
        </FormRow>
      </Section>
      <Section>
        <SectionTitle>🌐 URL Preview</SectionTitle>
        <SmartFormField
          label="Reference Image URL"
          field="testUrl"
          value={formData.testUrl || ''}
          formData={formData}
          onChange={handleChange}
          type="url"
          placeholder="https://example.com/image.jpg"
          helpText="Enter a URL to an image or other media"
          previewUrl={true}
        />
      </Section>
      <Section>
        <SectionTitle>📅 Date Picker</SectionTitle>
        <FormRow>
          <SmartFormField
            label="Creation Date"
            field="testDate"
            value={formData.testDate || {}}
            formData={formData}
            onChange={handleChange}
            type="date"
            helpText="When was this artwork created?"
          />
          <SmartFormField
            label="Exhibition Date"
            field="testDate"
            value={formData.testDate || {}}
            formData={formData}
            onChange={handleChange}
            type="date"
            helpText="When will this artwork be exhibited?"
          />
        </FormRow>
      </Section>
      <Section>
        <SectionTitle>📁 File Upload</SectionTitle>
        <SmartFormField
          label="Artwork Images"
          field="testFile"
          value={formData.testFile}
          formData={formData}
          onChange={handleChange}
          type="file"
          accept="image/*"
          multiple={true}
          helpText="Upload one or more images of your artwork"
        />
      </Section>
      <Section>
        <SectionTitle>📊 Form Data</SectionTitle>
        <DataDisplay>
          {JSON.stringify(formData, null, 2)}
        </DataDisplay>
      </Section>
    </PageContainer>
  );
}
