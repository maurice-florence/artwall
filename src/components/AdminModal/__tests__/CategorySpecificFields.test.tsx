// src/components/AdminModal/__tests__/CategorySpecificFields.test.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\__tests__\CategorySpecificFields.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import { CategorySpecificFields } from '../components';
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
    language1: 'nl',
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
    language2: '',
    language3: '',
    url1: '',
    url2: '',
    url3: ''
  };

  const baseProps = {
    errors: {},
    updateField: vi.fn(),
    shouldShowField: () => true,
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders music fields for music category', () => {
  const audioFormData = { ...mockFormData, medium: 'audio' as const };
  renderWithTheme(<CategorySpecificFields {...baseProps} formData={audioFormData} />);
    expect(screen.getByLabelText(/tekst/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/akkoorden/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/soundcloud embed url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/soundcloud track url/i)).toBeInTheDocument();
  });

  it('renders media fields for image category', () => {
  const drawingFormData = { ...mockFormData, medium: 'drawing' as const };
  renderWithTheme(<CategorySpecificFields {...baseProps} formData={drawingFormData} />);
    
    expect(screen.getByLabelText(/^[Mm]edia Type$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^[Mm]edia URL$/)).toBeInTheDocument();
  });

  it('renders nothing for categories without specific fields', () => {
  const poemFormData = { ...mockFormData, medium: 'writing' as const };
  // For writing, mimic that smart logic hides these fields
  renderWithTheme(<CategorySpecificFields {...baseProps} shouldShowField={() => false} formData={poemFormData} />);
    
    expect(screen.queryByLabelText('Tekst')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Media Type')).not.toBeInTheDocument();
  });
});