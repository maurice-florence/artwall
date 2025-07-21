// src/components/__tests__/AdminModal.test.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\__tests__\AdminModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import AdminModal from '@/components/AdminModal';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('@/firebase', () => ({
  db: {},
  storage: {}
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(),
  update: vi.fn(),
  get: vi.fn(),
  onValue: vi.fn(),
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

  it('renders modal when open', () => {
    renderWithTheme(<AdminModal {...mockProps} />);
    expect(screen.getByText('Nieuw Kunstwerk')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithTheme(<AdminModal {...mockProps} />);
    const submitButton = screen.getByRole('button', { name: /opslaan|save/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/titel is verplicht/i)).toBeInTheDocument();
      expect(screen.getByText(/voer een geldig jaar in/i)).toBeInTheDocument();
    });
  });

  it('handles form submission correctly', async () => {
    const mockPush = vi.fn().mockResolvedValue({ key: 'test-id' });
    vi.mocked(require('firebase/database').push).mockImplementation(mockPush);
    
    renderWithTheme(<AdminModal {...mockProps} />);
    
    fireEvent.change(screen.getByPlaceholderText('Titel van het kunstwerk'), {
      target: { value: 'Test Artwork' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /opslaan/i }));
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});