// src/app/layout.tsx (Server Component)
import React from 'react';
import StyledComponentsRegistry from '../lib/registry';
import ClientProviders from '@/app/ClientProviders';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params?: Promise<Record<string, string | string[] | undefined>>
}) {
  // Await params for Next.js 15 compliance (even if not used)
  if (params) await params;
  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0b8783" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ClientProviders>
            {children}
          </ClientProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
