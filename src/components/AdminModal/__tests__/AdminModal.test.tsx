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
      await userEvent.click(submitButton);
      // Debug: print DOM after submit
      screen.debug();
      // Assert pushMock was called
      expect(globalThis.pushMock).toHaveBeenCalled();
      // Log pushMock call arguments
      // eslint-disable-next-line no-console
      console.log('pushMock calls:', globalThis.pushMock.mock.calls);
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
import { within } from '@testing-library/react';
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
    describe('Error States', () => {
      it('shows validation error when required fields are missing', async () => {
        renderWithTheme(<AdminModal {...mockProps} />);
        // Explicitly clear all required fields
        await userEvent.clear(screen.getByLabelText('Titel'));
        await userEvent.clear(screen.getByLabelText('Jaar'));
            // Print raw errors-debug before submit
            const errorsDebugBefore = screen.getByTestId('errors-debug');
            // eslint-disable-next-line no-console
            console.log('RAW errors-debug before submit:', errorsDebugBefore.textContent);
            let debugBeforeParsed: Record<string, any> = {};
            try {
              debugBeforeParsed = JSON.parse(errorsDebugBefore.textContent || '{}');
            } catch (e) {
              // eslint-disable-next-line no-console
              console.log('Could not parse errors-debug before submit:', e);
            }
            // eslint-disable-next-line no-console
            console.log('Parsed errors-debug before submit:', debugBeforeParsed);
            const submitButton = screen.getByRole('button', { name: /opslaan/i });
            await userEvent.click(submitButton);
            // Wait for state updates to propagate
            await new Promise(res => setTimeout(res, 500));
            // Print raw errors-debug after submit
            const errorsDebugAfter = screen.getByTestId('errors-debug');
            let errorsDebugAfterRaw: string = '';
            let debugAfterParsed: Record<string, any> = {};
            let formDataAfter: Record<string, any> = {};
            let errorsAfter: Record<string, any> = {};
            if (errorsDebugAfter) {
              errorsDebugAfterRaw = errorsDebugAfter.textContent || '';
              try {
                debugAfterParsed = JSON.parse(errorsDebugAfterRaw || '{}');
                formDataAfter = (debugAfterParsed && typeof debugAfterParsed.formData === 'object') ? debugAfterParsed.formData : {};
                errorsAfter = (debugAfterParsed && typeof debugAfterParsed.errors === 'object') ? debugAfterParsed.errors : {};
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log('Could not parse errors-debug after submit:', e);
              }
            }
            // eslint-disable-next-line no-console
            console.log('RAW errors-debug after submit:', errorsDebugAfterRaw);
            // eslint-disable-next-line no-console
            console.log('Parsed errors-debug after submit:', debugAfterParsed);
            // Print the full debug output to the terminal for inspection
            // eslint-disable-next-line no-console
            console.log('FULL DEBUG OUTPUT AFTER SUBMIT:', {
              errorsDebugAfterRaw,
              errorsDebugAfterParsed: debugAfterParsed,
              formDataAfter,
              errorsAfter,
            });
            // Write debug output to a file for inspection
            const fs = require('fs');
            fs.writeFileSync(
          'c:/Users/friem/OneDrive/Documenten/GitHub/artwall/debug-output.json',
          JSON.stringify({
            errorsDebugAfterRaw,
            errorsDebugAfterParsed: debugAfterParsed,
            formDataAfter,
            errorsAfter,
          }, null, 2)
        );
        // Add more visible debug output in the DOM for manual inspection
        const debugDom = document.createElement('div');
        debugDom.setAttribute('id', 'manual-debug-output');
        debugDom.style.color = 'red';
        debugDom.style.fontSize = '12px';
        debugDom.innerText = JSON.stringify({
          errorsDebugAfterRaw,
          errorsDebugAfterParsed: debugAfterParsed,
          formDataAfter,
          errorsAfter,
        }, null, 2);
        document.body.appendChild(debugDom);
        // Try to find the error message by testid
        let errorMessage;
        try {
          errorMessage = await screen.findByTestId('error-message');
          // eslint-disable-next-line no-console
          console.log('Error message found by testid:', errorMessage.textContent);
          expect(errorMessage.textContent).toMatch(/verplicht|Er zijn verplichte velden niet ingevuld/);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('Error message not found by testid.');
          expect(false).toBe(true);
        }
      });

      it('shows submission error when Firebase fails', async () => {
        // Mock pushMock to simulate failure
        globalThis.pushMock = vi.fn(() => Promise.reject(new Error('Firebase error')));
        renderWithTheme(<AdminModal {...mockProps} />);
        await userEvent.type(screen.getByLabelText('Titel'), 'Test Error');
        await userEvent.selectOptions(screen.getByLabelText('Medium *'), 'writing');
        await userEvent.clear(screen.getByLabelText('Jaar'));
        await userEvent.type(screen.getByLabelText('Jaar'), '2025');
        await userEvent.type(screen.getByLabelText(/Inhoud \*/i), 'Test content');
        const submitButton = screen.getByRole('button', { name: /opslaan/i });
        await userEvent.click(submitButton);
        // Debug: print DOM after submit
        screen.debug();
        // Print the entire DOM after submit for debugging
        // eslint-disable-next-line no-console
        console.log('DOM after submit:', document.body.innerHTML);
        // Wait for error messages to appear
        // Wait for error message to appear by testid
        const errorMessage = await screen.findByTestId('error-message');
        // eslint-disable-next-line no-console
        console.log('Submission error message found by testid:', errorMessage.textContent);
        expect(errorMessage.textContent).toMatch(/Firebase error|fout/);
      });
    });
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
        // Write debug output to a file for inspection
            const errorsDebugAfter = document.getElementById('errors-debug');
            let errorsDebugAfterRaw: string = '';
            let debugAfterParsed: Record<string, any> = {};
            let formDataAfter: Record<string, any> = {};
            let errorsAfter: Record<string, any> = {};
            if (errorsDebugAfter) {
              errorsDebugAfterRaw = errorsDebugAfter.textContent || '';
              try {
                debugAfterParsed = JSON.parse(errorsDebugAfterRaw || '{}');
                formDataAfter = (debugAfterParsed && typeof debugAfterParsed.formData === 'object') ? debugAfterParsed.formData : {};
                errorsAfter = (debugAfterParsed && typeof debugAfterParsed.errors === 'object') ? debugAfterParsed.errors : {};
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log('Could not parse errors-debug after submit:', e);
              }
            }
            const fs = require('fs');
            fs.writeFileSync(
              'c:/Users/friem/OneDrive/Documenten/GitHub/artwall/debug-output.json',
              JSON.stringify({
                errorsDebugAfterRaw,
                errorsDebugAfterParsed: debugAfterParsed,
                formDataAfter,
                errorsAfter,
              }, null, 2)
        );
        // Add more visible debug output in the DOM for manual inspection
        const debugDom = document.createElement('div');
        debugDom.setAttribute('id', 'manual-debug-output');
        debugDom.style.color = 'red';
        debugDom.style.fontSize = '12px';
        debugDom.innerText = JSON.stringify({
            errorsDebugAfterRaw: errorsDebugAfter?.textContent || '',
          errorsDebugAfterParsed: debugAfterParsed,
          formDataAfter: debugAfterParsed.formData,
          errorsAfter: debugAfterParsed.errors,
        }, null, 2);
        document.body.appendChild(debugDom);
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
      // Debug: print submit button state
      // eslint-disable-next-line no-console
      console.log('Test: Submitting form using userEvent.click');
      // eslint-disable-next-line no-console
      console.log('Test: Submit button before click:', submitButton);
      // Click submit
      await userEvent.click(submitButton);
      // Debug: print DOM after click
    }, 30000);
  });