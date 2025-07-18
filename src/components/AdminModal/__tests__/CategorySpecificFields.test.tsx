// src/components/AdminModal/__tests__/CategorySpecificFields.test.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\__tests__\CategorySpecificFields.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import { CategorySpecificFields } from '../components/CategorySpecificFields';
import { ArtworkFormData } from '@/types';
import { vi } from 'vitest'; // ✅ Add this import

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={atelierTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('CategorySpecificFields', () => {
  const mockFormData: ArtworkFormData = {
    title: 'Test',
    medium: 'writing',
    subtype: 'poem',
    year: 2025,
    month: 7,
    day: 15,
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
  };

  const mockProps = {
    formData: mockFormData,
    errors: {},
    updateField: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders music fields for music category', () => {
    renderWithTheme(<CategorySpecificFields {...mockProps} />);
    
    expect(screen.getByLabelText('Tekst')).toBeInTheDocument();
    expect(screen.getByLabelText('Akkoorden')).toBeInTheDocument();
    expect(screen.getByLabelText('SoundCloud Embed URL')).toBeInTheDocument();
    expect(screen.getByLabelText('SoundCloud Track URL')).toBeInTheDocument();
  });

  it('renders media fields for image category', () => {
    const imageFormData = { ...mockFormData, category: 'image' as const };
    renderWithTheme(<CategorySpecificFields {...mockProps} formData={imageFormData} />);
    
    expect(screen.getByLabelText('Media Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Media URL')).toBeInTheDocument();
  });

  it('renders nothing for categories without specific fields', () => {
    const poemFormData = { ...mockFormData, category: 'poem' as const };
    renderWithTheme(<CategorySpecificFields {...mockProps} formData={poemFormData} />);
    
    expect(screen.queryByLabelText('Tekst')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Media Type')).not.toBeInTheDocument();
  });
});