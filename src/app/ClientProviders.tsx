"use client";

import React, { useContext, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, ThemeContext } from '@/context/ThemeContext';
import { GlobalStyle } from '@/GlobalStyle';
import ScrollToTop from '@/components/ScrollToTop';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedShell>
        {children}
        <RegisterSW />
      </ThemedShell>
    </ThemeProvider>
  );
}

function ThemedShell({ children }: { children: React.ReactNode }) {
  const { themeObject } = useContext(ThemeContext) as any;
  return (
    <>
      <GlobalStyle theme={themeObject} />
      <Toaster position="bottom-center" />
      {children}
      <ScrollToTop />
    </>
  );
}

function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const timer = setTimeout(() => {
        navigator.serviceWorker.register('/sw.js').catch(() => {/* ignore */});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  return null;
}
