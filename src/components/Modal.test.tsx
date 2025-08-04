import React from 'react';
import { vi } from 'vitest';

// Fallback mock for Next.js router context
const RouterContext = React.createContext({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
});
const createMockRouter = (router = {}) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  ...router,
});
import { render, screen } from '@testing-library/react';
import Modal from './Modal';
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

describe('Modal', () => {
  it('renders without crashing and displays artwork title', () => {
    // Use Next.js router context provider for Modal
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <RouterContext.Provider value={createMockRouter({})}>
        <div id="__next">{children}</div>
      </RouterContext.Provider>
    );
    render(<Modal isOpen={true} onClose={() => {}} item={mockArtwork} />, { wrapper: Wrapper });
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('Test');
  });
});
