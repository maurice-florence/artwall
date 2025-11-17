"use client";

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
    // Prefer a persisted theme name for stability; fall back to legacy stored object
    const savedThemeName = localStorage.getItem('artwall-theme-name') as ThemeName | null;
    if (savedThemeName && themes[savedThemeName]) {
      setThemeObject(themes[savedThemeName]);
      return;
    }
    const savedTheme = localStorage.getItem('artwall-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        // Very light validation
        if (parsed && parsed.primary && parsed.secondary && parsed.tertiary) {
          setThemeObject(parsed as Theme);
        }
      } catch {
        // ignore invalid legacy value
      }
    }
  }, []);

  const toggleTheme = (themeName: ThemeName) => {
    const newTheme = themes[themeName];
    if (newTheme) {
      setThemeObject(newTheme);
      // persist the chosen theme by name
      try {
        localStorage.setItem('artwall-theme-name', themeName);
      } catch {}
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
    try {
      localStorage.setItem('artwall-theme', JSON.stringify(themeObject));
    } catch {}
  };

  const resetTheme = () => {
    // Clear any saved custom theme and reset to the blueprint defaults
    try {
      localStorage.removeItem('artwall-theme');
      localStorage.removeItem('artwall-theme-name');
    } catch {}
    setThemeObject(blueprintTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeObject, toggleTheme, updateThemeColor, updateThemeColors, resetTheme, saveThemeAsDefault, cardHeight, setCardHeight, gridGap }}>
      <StyledThemeProvider theme={themeObject}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
