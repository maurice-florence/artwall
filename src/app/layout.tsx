// src/app/layout.tsx
"use client"; // Nodig voor de ThemeProvider

import React, { useContext, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '../context/ThemeContext';
import { GlobalStyle } from '../GlobalStyle'; // We maken dit bestand zo
import ScrollToTop from '../components/ScrollToTop';
import StyledComponentsRegistry from '../lib/registry';
// import { FilterProvider } from '@/context/FilterContext';
import { ArtworksProvider } from '../context/ArtworksContext';



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b8783" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ArtworksProvider>
          <ThemeProvider>
            <ThemedApp>{children}</ThemedApp>
          </ThemeProvider>
        </ArtworksProvider>
        <ScriptRegisterSW />
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

// Service worker registration for PWA (basic). Non-blocking.
function ScriptRegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Delay registration slightly to not compete with page critical path
      const timer = setTimeout(() => {
        navigator.serviceWorker.register('/sw.js').catch(() => {/* ignore */});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  return null;
}
