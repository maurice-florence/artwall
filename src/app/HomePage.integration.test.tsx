import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ArtworkCard from '@/components/ArtworkCard';
import AdminModal from '@/components/AdminModal';
import NewEntryModal from '@/components/NewEntryModal';
import { useArtworks } from '@/context/ArtworksContext';
import React from 'react';

jest.mock('@/context/ArtworksContext');

const mockArtworks = [
  {
    id: '1',
    title: 'Test Art',
    description: 'Test Description',
    medium: 'painting',
    year: 2022,
    isHidden: false,
    month: 1,
    day: 1,
  },
  {
    id: '2',
    title: 'Hidden Art',
    description: 'Hidden Description',
    medium: 'drawing',
    year: 2021,
    isHidden: true,
    month: 2,
    day: 2,
  },
];

describe('Artwall App Integration', () => {
  beforeEach(() => {
    (useArtworks as jest.Mock).mockReturnValue({ artworks: mockArtworks, isLoading: false });
  });

  it('renders HomePage and shows visible artworks', () => {
    render(<HomePage />);
    expect(screen.getByText('Test Art')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Art')).not.toBeInTheDocument();
  });

  it('filters by medium', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByText('painting'));
    expect(screen.getByText('Test Art')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Art')).not.toBeInTheDocument();
  });

  it('filters by year', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByText('2022'));
    expect(screen.getByText('Test Art')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Art')).not.toBeInTheDocument();
  });

  it('searches by title', () => {
    render(<HomePage />);
    fireEvent.change(screen.getByPlaceholderText('Zoek...'), { target: { value: 'Test' } });
    expect(screen.getByText('Test Art')).toBeInTheDocument();
  });

  it('opens and closes AdminModal', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTitle('Voeg een nieuwe kaart toe'));
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/sluiten/i));
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
  });

  it('opens and closes NewEntryModal', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByText('Test Art'));
    fireEvent.click(screen.getByText(/bewerken/i));
    expect(screen.getByText(/opslaan/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/sluiten/i));
    expect(screen.queryByText(/opslaan/i)).not.toBeInTheDocument();
  });

  it('renders Footer and Sidebar', () => {
    render(<HomePage />);
    expect(screen.getByText(/footer/i)).toBeInTheDocument();
    expect(screen.getByText(/sidebar/i)).toBeInTheDocument();
  });
});
