import { render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';
import { Artwork } from '@/types';

const mockArtworks: Artwork[] = [
  {
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
  },
];

describe('Sidebar', () => {
  it('renders without crashing and displays artwork title', () => {
    render(<Sidebar isOpen={true} allArtworks={mockArtworks} onClose={() => {}} />);
    // Use data-testid for Sidebar root and artwork item
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('artwork-title-1')).toHaveTextContent('Test');
  });
});
