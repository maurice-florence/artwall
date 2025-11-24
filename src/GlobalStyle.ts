import { createGlobalStyle, DefaultTheme } from 'styled-components';

export const GlobalStyle = createGlobalStyle<{ theme: DefaultTheme }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    overflow-y: scroll; /* Always show scrollbar to prevent layout shift */
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #1E3A8A;
  }
`;
