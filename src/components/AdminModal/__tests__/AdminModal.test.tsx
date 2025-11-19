declare global {
  // eslint-disable-next-line no-var
  var pushMock: ReturnType<typeof vi.fn>;
}
globalThis.pushMock = vi.fn((...args) => Promise.resolve({ key: 'test-id' }));
import { vi } from 'vitest';
// Move all mocks to the very top before any imports
globalThis.pushMock = vi.fn((...args) => Promise.resolve({ key: 'test-id' }));
vi.mock('firebase/database', () => {
  const push = globalThis.pushMock;
  const refMock = vi.fn((db, path) => ({
    key: path?.split('/').pop() || null,
    parent: null,
    toString: () => path || '',
    _path: path,
  }));
  return {
    __esModule: true,
    ref: refMock,
    push,
    update: vi.fn(() => Promise.resolve()),
    get: vi.fn(() => Promise.resolve({ exists: () => false })),
    default: { push }
  };

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

    it('handles form submission correctly', async () => {
      renderWithTheme(<AdminModal {...mockProps} />);
      // Assert submit button is present and enabled
      const submitButton = screen.getByRole('button', { name: /opslaan/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      // Increase timeout for this test
    }, 20000);
  });
});
vi.mock('@/firebase', () => ({
  db: {},
  storage: {},
  realtimeDb: {} // Add mock for realtimeDb
}));


import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import AdminModal from '../AdminModal';
import { Artwork } from '@/types';
import userEvent from '@testing-library/user-event';

const mockProps = {
  isOpen: true,
  onClose: vi.fn(),
  artworkToEdit: null
};

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
    globalThis.pushMock = vi.fn((...args) => Promise.resolve({ key: 'test-id' }));
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

    // (moved to main describe block)
    it('handles form submission correctly', async () => {
      renderWithTheme(<AdminModal {...mockProps} />);
      // Debug: print DOM tree after rendering
      screen.debug();
      await userEvent.selectOptions(screen.getByLabelText('Medium *'), 'writing');
      await userEvent.clear(screen.getByLabelText('Jaar'));
      await userEvent.type(screen.getByLabelText('Jaar'), '2025');
      await userEvent.type(screen.getByLabelText(/Inhoud \*/i), 'Test content');
      const language1Select = screen.queryByRole('combobox', { name: /primaire taal/i });
      if (language1Select) {
        await userEvent.selectOptions(language1Select, 'nl');
      }
      const requiredFields = [
        'Submedium', 'Beschrijving', 'Versie', 'Primaire taal', 'Media type', 'Tags', 'Locatie 1', 'Locatie 2'
      ];
      for (const label of requiredFields) {
        const input = screen.queryByLabelText(new RegExp(label + ' \*', 'i'));
        if (input) {
          await userEvent.type(input, 'test');
        }
      }

      const submitButton = screen.getByRole('button', { name: /opslaan/i });
      expect(globalThis.pushMock).not.toHaveBeenCalled();
      // eslint-disable-next-line no-console
      console.log('Test: Submitting form using userEvent.click');
      // eslint-disable-next-line no-console
      console.log('Test: Submit button before click:', submitButton);
      // Click submit
      await userEvent.click(submitButton);
      // Explicitly trigger form submit event
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      // eslint-disable-next-line no-console
      console.log('Test: Submit button clicked, waiting for pushMock');
      await waitFor(() => {
        expect(globalThis.pushMock).toHaveBeenCalled();
        // eslint-disable-next-line no-console
        console.log('Test: pushMock called');
      }, { timeout: 10000 });
      screen.debug();
      await waitFor(() => {
        expect(globalThis.pushMock).toHaveBeenCalled();
        // eslint-disable-next-line no-console
        console.log('Test: pushMock called');
      }, { timeout: 10000 });
    });
  });