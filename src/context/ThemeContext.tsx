import React, { createContext, useState, ReactNode, useEffect } from 'react';
import type { Theme } from '@/styled';
import { blueprintTheme, themes, ThemeName } from '../themes';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Definieer het type voor de waarde van de context
interface ThemeContextType {
  themeObject: Theme;
  toggleTheme: (themeName: ThemeName) => void;
  updateThemeColor: (colorKey: keyof Theme, value: string) => void;
  updateThemeColors: (colors: Partial<Theme>) => void;
  resetTheme: () => void;
  saveThemeAsDefault: () => void;
  cardHeight: number;
  setCardHeight: (height: number) => void;
  gridGap: number;
}

// Geef een default waarde die overeenkomt met de interface
export const ThemeContext = createContext<ThemeContextType>({
  themeObject: blueprintTheme,
  toggleTheme: () => {},
  updateThemeColor: () => console.warn('no theme provider'),
  updateThemeColors: () => console.warn('no theme provider'),
  resetTheme: () => console.warn('no theme provider'),
  saveThemeAsDefault: () => console.warn('no theme provider'),
  cardHeight: 280,
  setCardHeight: () => {},
  gridGap: 24,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeObject, setThemeObject] = useState<Theme>(blueprintTheme);
  const [cardHeight, setCardHeight] = useState<number>(blueprintTheme.cardHeight || 280);
  const [gridGap] = useState<number>(blueprintTheme.gridGap || 24);

  useEffect(() => {
    const savedTheme = localStorage.getItem('artwall-theme');
    if (savedTheme) {
      setThemeObject(JSON.parse(savedTheme));
    }
  }, []);

  const toggleTheme = (themeName: ThemeName) => {
    const newTheme = themes[themeName];
    if (newTheme) {
      setThemeObject(newTheme);
    }
  };

  const updateThemeColor = (colorKey: keyof Theme, value: string) => {
    // Allow updating/adding color keys even if they were not previously present
    setThemeObject(prev => ({ ...prev, [colorKey]: value }));
  };

  const updateThemeColors = (colors: Partial<Theme>) => {
    setThemeObject(prev => ({ ...prev, ...colors }));
  };

  const saveThemeAsDefault = () => {
    localStorage.setItem('artwall-theme', JSON.stringify(themeObject));
  };

  const resetTheme = () => {
    // Clear any saved custom theme and reset to the blueprint defaults
    localStorage.removeItem('artwall-theme');
    setThemeObject(blueprintTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeObject, toggleTheme, updateThemeColor, updateThemeColors, resetTheme, saveThemeAsDefault, cardHeight, setCardHeight, gridGap }}>
      <StyledThemeProvider theme={themeObject}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
