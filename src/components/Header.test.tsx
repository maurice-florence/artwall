import { render, screen } from '@testing-library/react';
import Header from './Header';

const mockProps = {
  onToggleSidebar: jest.fn(),
  isSidebarOpen: true,
  selectedMedium: 'drawing',
  setSelectedMedium: jest.fn(),
  selectedSubtype: 'sketch',
  setSelectedSubtype: jest.fn(),
  searchTerm: '',
  setSearchTerm: jest.fn(),
  sortOrder: 'asc',
  setSortOrder: jest.fn(),
  filterYear: null,
  setFilterYear: jest.fn(),
  selectedYear: '2020',
  setSelectedYear: jest.fn(),
  availableMediums: ['drawing', 'writing'],
  availableYears: ['2020', '2021'],
};

describe('Header', () => {
  it('renders without crashing and shows title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('header-title')).toHaveTextContent('Kunstmuur');
    expect(screen.getByTestId('header-title-row')).toBeInTheDocument();
    expect(screen.getByTestId('header-controls-row')).toBeInTheDocument();
    expect(screen.getByTestId('header-filters')).toBeInTheDocument();
    expect(screen.getByTestId('header-medium-icons')).toBeInTheDocument();
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
    expect(screen.getByTestId('header-theme-switcher')).toBeInTheDocument();
  });
});
