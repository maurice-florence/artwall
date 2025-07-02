// src/app/layout.tsx
"use client"; // Nodig voor de ThemeProvider

import React, { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { GlobalStyle } from '../GlobalStyle'; // We maken dit bestand zo
import ScrollToTop from '../components/ScrollToTop';
import StyledComponentsRegistry from '../lib/registry';
import { FilterProvider } from '@/context/FilterContext';
import { ArtworksProvider } from '../context/ArtworksContext';



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>
        <FilterProvider>
          <ArtworksProvider>
            <ThemeProvider>
              <ThemedApp>{children}</ThemedApp>
            </ThemeProvider>
          </ArtworksProvider>
        </FilterProvider>
      </body>
    </html>
  )
}

function ThemedApp({ children }: { children: React.ReactNode }) {
  // Get theme from ThemeContext with correct typing
  const { themeObject } = useContext(require('../context/ThemeContext').ThemeContext) as { themeObject: any };
  return (
    <StyledComponentsRegistry>
      <GlobalStyle theme={themeObject} />
      <Toaster position="bottom-center" />
      {children}
      <ScrollToTop />
    </StyledComponentsRegistry>
  );
}
