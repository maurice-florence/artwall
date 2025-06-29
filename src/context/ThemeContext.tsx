import React, { createContext, useState, ReactNode } from 'react';
import { atelierTheme, blueprintTheme, darkModeTheme, ThemeName, Theme } from '../themes';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Definieer het type voor de waarde van de context
interface ThemeContextType {
  theme: ThemeName;
  themeObject: Theme;
  toggleTheme: (themeName: ThemeName) => void;
  updateThemeColor: (colorKey: keyof Theme, value: string) => void;
  cardHeight: number;
  setCardHeight: (height: number) => void;
  gridGap: number;
}

// Geef een default waarde die overeenkomt met de interface
export const ThemeContext = createContext<ThemeContextType>({
  theme: 'atelier',
  themeObject: atelierTheme,
  toggleTheme: () => console.warn('no theme provider'),
  updateThemeColor: () => console.warn('no theme provider'),
  cardHeight: 280,
  setCardHeight: () => {},
  gridGap: 24,
});

const themes: Record<ThemeName, Theme> = {
  atelier: atelierTheme,
  blueprint: blueprintTheme,
  dark: darkModeTheme,
  nature: require('../themes').natureTheme,
  earth: require('../themes').earthTheme,
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>('atelier');
  const [themeObject, setThemeObject] = useState<Theme>(themes['atelier']);
  const [cardHeight, setCardHeight] = useState<number>(themes['atelier'].cardHeight || 280);
  const [gridGap] = useState<number>(themes['atelier'].gridGap || 24);

  const toggleTheme = (themeName: ThemeName) => {
    setTheme(themeName);
    setThemeObject(themes[themeName]);
    setCardHeight(themes[themeName].cardHeight || 280);
    // gridGap is static per theme
  };

  // Only allow updating top-level string color keys (not nested objects)
  const updateThemeColor = (colorKey: keyof Theme, value: string) => {
    if (typeof themeObject[colorKey] === 'string') {
      setThemeObject({ ...themeObject, [colorKey]: value });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeObject, toggleTheme, updateThemeColor, cardHeight, setCardHeight, gridGap }}>
      <StyledThemeProvider theme={themeObject}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
