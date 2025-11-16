// src/components/__tests__/Header.mobile.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@/__tests__/test-utils';
import Header from '@/components/Header';

const baseProps = {
  selectedMedium: 'all',
  setSelectedMedium: () => {},
  selectedYear: 'all',
  setSelectedYear: () => {},
  availableMediums: ['drawing', 'writing', 'audio'],
  availableYears: ['2025', '2024'],
  searchTerm: '',
  setSearchTerm: () => {},
  selectedEvaluation: 'all' as const,
  setSelectedEvaluation: () => {},
  selectedRating: 'all' as const,
  setSelectedRating: () => {},
};

describe('Header mobile layout', () => {
  beforeEach(() => {
    (window as any).innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
  });

  it('stacks controls and makes search full-width on mobile (via data attributes)', () => {
    render(<Header {...baseProps} />);

    const controls = screen.getByTestId('header-controls-row');
    expect(controls).toHaveAttribute('data-stacked', 'true');

    const searchWrapper = controls.querySelector('[data-fullwidth="true"]');
    expect(searchWrapper).not.toBeNull();

    // Ensure search input renders
    expect(screen.getByTestId('header-search')).toBeInTheDocument();
  });
});
