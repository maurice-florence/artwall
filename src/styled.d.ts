import 'styled-components';

export interface Theme {
  body: string;
  text: string;
  headerBg: string;
  headerText: string;
  accent: string;
  accentText: string;
  cardBg: string;
  cardText: string;
  categories: Record<string, string>;
  cardBackgrounds: Record<string, string>;
  primary: string;
  cardHeight: number;
  gridGap: number;
  border: string;
  textSecondary: string;
  secondary: string;
}

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
