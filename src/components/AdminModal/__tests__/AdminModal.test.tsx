// src/components/AdminModal/__tests__/AdminModal.test.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\__tests__\AdminModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import AdminModal from '../AdminModal';
import { vi } from 'vitest';
import { Artwork } from '@/types';

// Mock Firebase
vi.mock('@/firebase', () => ({
  db: {},
  storage: {}
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(() => Promise.resolve({ key: 'test-id' })),
  update: vi.fn(() => Promise.resolve()),
  get: vi.fn(() => Promise.resolve({ exists: () => false }))
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={atelierTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('AdminModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    artworkToEdit: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Behavior', () => {
    it('renders modal when open', () => {
      renderWithTheme(<AdminModal {...mockProps} />);
      expect(screen.getByText('Nieuw Kunstwerk')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithTheme(<AdminModal {...mockProps} isOpen={false} />);
      expect(screen.queryByText('Nieuw Kunstwerk')).not.toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      renderWithTheme(<AdminModal {...mockProps} />);
      fireEvent.click(screen.getByLabelText('Sluiten'));
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      renderWithTheme(<AdminModal {...mockProps} />);
      
      const submitButton = screen.getByRole('button', { name: /opslaan/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Titel is verplicht')).toBeInTheDocument();
      });
    });

    it('handles form submission correctly', async () => {
      const mockPush = vi.fn().mockResolvedValue({ key: 'test-id' });
      vi.mocked(require('firebase/database').push).mockImplementation(mockPush);
      
      renderWithTheme(<AdminModal {...mockProps} />);
      
      // Fill in required fields
      fireEvent.change(screen.getByPlaceholderText('Titel van het kunstwerk'), {
        target: { value: 'Test Artwork' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /opslaan/i }));
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    // Create a complete mock artwork that satisfies the Artwork type
    const mockArtwork: Artwork = {
      id: 'test-id',
      title: 'Test Artwork',
      medium: 'writing',
      subtype: 'poem',
      year: 2023,
      month: 12,
      day: 25,
      description: 'Test description',
      content: 'Test content',
      isHidden: false,
      mediaType: 'text',
      language1: 'nl',
      translations: {
        nl: {
          title: 'Test Artwork',
          description: 'Test description',
          content: 'Test content'
        }
      },
      recordCreationDate: Date.now(),
      recordLastUpdated: Date.now()
    };

    it('renders edit mode correctly', () => {
      renderWithTheme(<AdminModal {...mockProps} artworkToEdit={mockArtwork} />);
      expect(screen.getByText('Kunstwerk Bewerken')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Artwork')).toBeInTheDocument();
    });

    it('populates form with artwork data', () => {
      renderWithTheme(<AdminModal {...mockProps} artworkToEdit={mockArtwork} />);
      
      expect(screen.getByDisplayValue('Test Artwork')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2023')).toBeInTheDocument();
    });
  });
});