import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import ArtworkCard from './ArtworkCard';
import { Artwork } from '@/types';

const mockArtwork: Artwork = {
  id: '1',
  title: 'Test',
  year: 2020,
  medium: 'drawing',
  subtype: 'sketch',
  month: 1,
  day: 1,
  description: 'Test artwork',
  language1: 'nl',
  language2: '',
  translations: {},
  recordCreationDate: Date.now(),
};

describe('ArtworkCard', () => {
  it('renders without crashing and displays artwork title', () => {
    render(
      <ThemeProvider theme={atelierTheme}>
        <ArtworkCard artwork={mockArtwork} onSelect={vi.fn()} />
      </ThemeProvider>
    );
    expect(screen.getByTestId('artwork-card-1')).toBeInTheDocument();
    // Prefer heading role to avoid duplicates from generated image overlay
    expect(screen.getByRole('heading', { name: 'Test' })).toBeInTheDocument();
  });
});
