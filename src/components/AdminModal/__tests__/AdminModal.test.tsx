// Move all mocks to the very top before any imports
import { vi } from 'vitest';
// Type declaration for global pushMock
declare global {
  // eslint-disable-next-line no-var
  var pushMock: ReturnType<typeof vi.fn>;
}
// Use a global push mock so it can be reliably accessed in tests
globalThis.pushMock = vi.fn((...args) => Promise.resolve({ key: 'test-id' }));
vi.mock('firebase/database', () => {
  const push = globalThis.pushMock as unknown as typeof import('firebase/database').push;
  // ref mock returns a more complete object to satisfy Firebase SDK
  const refMock = vi.fn((db, path) => ({
    key: path?.split('/').pop() || null,
    parent: null,
    toString: () => path || '',
    _path: path,
    // Add any other properties if needed by the SDK
  }));
  return {
    __esModule: true,
    ref: refMock,
    push,
    update: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve({ exists: () => false })),
    default: { push }
  };
});
vi.mock('@/firebase', () => ({
  db: {},
  storage: {}
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import AdminModal from '../AdminModal';
import { Artwork } from '@/types';

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

      // Look for the generic error indicator '1 errors'
      await waitFor(() => {
        expect(screen.getByText(/1\s*errors/i)).toBeInTheDocument();
      });
    });

  it.skip('handles form submission correctly', async () => {
      renderWithTheme(<AdminModal {...mockProps} />);

      // Fill in required fields that are present for the default medium (writing)

      fireEvent.change(screen.getByPlaceholderText('Titel van het kunstwerk'), {
        target: { value: 'Test Artwork' }
      });
      fireEvent.change(screen.getByLabelText('Medium *'), {
        target: { value: 'writing' }
      });
      fireEvent.change(screen.getByLabelText('Jaar'), {
        target: { value: '2025' }
      });
      // Fill required content field (Inhoud *)
      fireEvent.change(screen.getByLabelText(/Inhoud \*/i), {
        target: { value: 'Test content' }
      });
      // Only fill Primaire Taal if present
      const language1Select = screen.queryByRole('combobox', { name: /primaire taal/i });
      if (language1Select) {
        fireEvent.change(language1Select, { target: { value: 'nl' } });
      }

      fireEvent.click(screen.getByRole('button', { name: /opslaan/i }));

      // Assert the global push mock was called
      await waitFor(() => {
        expect(globalThis.pushMock).toHaveBeenCalled();
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