import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { blueprintTheme, Theme } from '../themes';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Definieer het type voor de waarde van de context
interface ThemeContextType {
  themeObject: Theme;
  updateThemeColor: (colorKey: keyof Theme, value: string) => void;
  saveThemeAsDefault: () => void;
  cardHeight: number;
  setCardHeight: (height: number) => void;
  gridGap: number;
}

// Geef een default waarde die overeenkomt met de interface
export const ThemeContext = createContext<ThemeContextType>({
  themeObject: blueprintTheme,
  updateThemeColor: () => console.warn('no theme provider'),
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

  const updateThemeColor = (colorKey: keyof Theme, value: string) => {
    if (typeof themeObject[colorKey] === 'string') {
      setThemeObject({ ...themeObject, [colorKey]: value });
    }
  };

  const saveThemeAsDefault = () => {
    localStorage.setItem('artwall-theme', JSON.stringify(themeObject));
  };

  return (
    <ThemeContext.Provider value={{ themeObject, updateThemeColor, saveThemeAsDefault, cardHeight, setCardHeight, gridGap }}>
      <StyledThemeProvider theme={themeObject}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
