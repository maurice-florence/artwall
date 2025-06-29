import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FilterOptions {
  category: string;
  year: string;
}

export interface ViewOptions {
    spacing: 'compact' | 'comfortabel';
    layout: 'alternerend' | 'enkelzijdig';
    details: 'titels' | 'volledig';
    animations: boolean;
    theme: string;
}

interface FilterContextType {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  viewOptions: ViewOptions;
  setViewOptions: React.Dispatch<React.SetStateAction<ViewOptions>>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<FilterOptions>({ category: 'all', year: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    spacing: 'compact',
    layout: 'alternerend',
    details: 'volledig',
    animations: true,
    theme: 'atelier',
  });

  return (
    <FilterContext.Provider value={{ filters, setFilters, searchTerm, setSearchTerm, viewOptions, setViewOptions }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilterContext must be used within a FilterProvider');
  return context;
};
