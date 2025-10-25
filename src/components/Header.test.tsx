import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { vi } from 'vitest';

const mockProps = {
  selectedMedium: 'drawing',
  setSelectedMedium: vi.fn(),
  selectedYear: '2020',
  setSelectedYear: vi.fn(),
  availableMediums: ['drawing', 'writing'],
  availableYears: ['2020', '2021'],
  searchTerm: '',
  setSearchTerm: vi.fn(),
  selectedEvaluation: 'all' as const,
  setSelectedEvaluation: vi.fn(),
  selectedRating: 'all' as const,
  setSelectedRating: vi.fn(),
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

  it('opens evaluation dropdown and selects a value', () => {
    render(<Header {...mockProps} />);
    const evalBtn = screen.getByTestId('header-filter-evaluation');
    fireEvent.click(evalBtn);
    // After opening, the '3 seals of more' button should be present (title in Dutch)
    const threeBtn = screen.getByTitle('3 seals of meer');
    fireEvent.click(threeBtn);
    expect(mockProps.setSelectedEvaluation).toHaveBeenCalledWith(3);
  });

  it('opens rating dropdown and selects a value', () => {
    render(<Header {...mockProps} />);
    const ratingBtn = screen.getByTestId('header-filter-rating');
    fireEvent.click(ratingBtn);
    const fourBtn = screen.getByTitle('4 sterren of meer');
    fireEvent.click(fourBtn);
    expect(mockProps.setSelectedRating).toHaveBeenCalledWith(4);
  });
});
