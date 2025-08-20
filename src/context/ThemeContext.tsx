import React, { createContext, useState, ReactNode } from 'react';
import { atelierTheme, blueprintTheme, darkModeTheme, tealTheme, ThemeName, Theme } from '../themes';
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
  theme: 'blueprint',
  themeObject: blueprintTheme,
  toggleTheme: () => console.warn('no theme provider'),
  updateThemeColor: () => console.warn('no theme provider'),
  cardHeight: 280,
  setCardHeight: () => {},
  gridGap: 24,
});

const themes: Record<ThemeName, Theme> = {
  blueprint: blueprintTheme,
  dark: darkModeTheme,
  teal: tealTheme,
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeName>('blueprint');
  const [themeObject, setThemeObject] = useState<Theme>(themes['blueprint']);
  const [cardHeight, setCardHeight] = useState<number>(themes['blueprint'].cardHeight || 280);
  const [gridGap] = useState<number>(themes['blueprint'].gridGap || 24);

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
