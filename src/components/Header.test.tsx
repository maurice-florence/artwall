import { render, screen } from '@testing-library/react';
import Header from './Header';
import { vi } from 'vitest';

const mockProps = {
  onToggleSidebar: vi.fn(),
  isSidebarOpen: true,
  selectedMedium: 'drawing',
  setSelectedMedium: vi.fn(),
  selectedSubtype: 'sketch',
  setSelectedSubtype: vi.fn(),
  searchTerm: '',
  setSearchTerm: vi.fn(),
  sortOrder: 'asc',
  setSortOrder: vi.fn(),
  filterYear: null,
  setFilterYear: vi.fn(),
  selectedYear: '2020',
  setSelectedYear: vi.fn(),
  availableMediums: ['drawing', 'writing'],
  availableYears: ['2020', '2021'],
};

describe('Header', () => {
  it('renders without crashing and shows title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('header-title')).toHaveTextContent('Artwall');
    expect(screen.getByTestId('header-title-row')).toBeInTheDocument();
    expect(screen.getByTestId('header-controls-row')).toBeInTheDocument();
    expect(screen.getByTestId('header-filters')).toBeInTheDocument();
    expect(screen.getByTestId('header-medium-icons')).toBeInTheDocument();
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
    expect(screen.getByTestId('header-theme-switcher')).toBeInTheDocument();
  });
});
