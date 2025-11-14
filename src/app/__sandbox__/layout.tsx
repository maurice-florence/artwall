import React, { ReactNode } from 'react';
import { notFound } from 'next/navigation';

// Sandbox layout: hides all nested sandbox routes unless NEXT_PUBLIC_ENABLE_SANDBOX === 'true'.
// This prevents accidental exposure of experimental pages in production.
export default function SandboxLayout({ children }: { children: ReactNode }) {
  if (process.env.NEXT_PUBLIC_ENABLE_SANDBOX !== 'true') {
    notFound();
  }
  return (
    <div style={{ padding: '1rem', border: '4px dashed #FFA726', margin: '1rem', borderRadius: '12px' }}>
      <h1 style={{ marginTop: 0, fontSize: '1.5rem' }}>🧪 Sandbox Area</h1>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem' }}>
        Experimental pages. Set NEXT_PUBLIC_ENABLE_SANDBOX=true to access. Not for production use.
      </p>
      {children}
    </div>
  );
}
