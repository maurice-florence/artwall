// src/components/AdminModal/__tests__/BasicInfoForm.test.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\__tests__\BasicInfoForm.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { ArtworkFormData } from '@/types';
import { vi } from 'vitest'; // ✅ Add this import

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={atelierTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('BasicInfoForm', () => {
  const mockFormData: ArtworkFormData = {
    title: '',
    category: 'poetry',
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

  it('renders basic info fields', () => {
    renderWithTheme(<BasicInfoForm {...mockProps} />);
    
    expect(screen.getByLabelText('Titel *')).toBeInTheDocument();
    expect(screen.getByLabelText('Categorie *')).toBeInTheDocument();
    expect(screen.getByLabelText('Jaar *')).toBeInTheDocument();
    expect(screen.getByLabelText('Maand')).toBeInTheDocument();
    expect(screen.getByLabelText('Dag')).toBeInTheDocument();
  });

  it('calls updateField when title changes', () => {
    renderWithTheme(<BasicInfoForm {...mockProps} />);
    
    const titleInput = screen.getByLabelText('Titel *');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    
    expect(mockProps.updateField).toHaveBeenCalledWith('title', 'New Title');
  });

  it('shows error messages', () => {
    const propsWithErrors = {
      ...mockProps,
      errors: { title: 'Titel is verplicht' }
    };
    
    renderWithTheme(<BasicInfoForm {...propsWithErrors} />);
    
    expect(screen.getByText('Titel is verplicht')).toBeInTheDocument();
  });
});