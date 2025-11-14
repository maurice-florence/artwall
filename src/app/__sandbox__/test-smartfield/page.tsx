// relocated from src/app/test-smartfield/page.tsx into sandbox
"use client";

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { atelierTheme } from '@/themes';
import { SmartFormFieldTest } from '@/components/AdminModal/components/SmartFormFieldTest';

export default function TestSmartFieldPage() {
  return (
    <ThemeProvider theme={atelierTheme}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🧪 SmartFormField Test Page</h1>
        <p>Testing the enhanced form field with real-time validation.</p>
        <SmartFormFieldTest />
      </div>
    </ThemeProvider>
  );
}
