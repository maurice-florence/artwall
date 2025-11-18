"use client";

import React from 'react';
import { PageWrapper, StatGrid, StatCard, StatTitle, StatValue } from '@/app/stats/StatsPage.styles';
import type { Artwork } from '@/types';

export default function StatsClient({ allArtworks }: { allArtworks: Artwork[] }) {
  if (!allArtworks || allArtworks.length === 0) {
    return <PageWrapper>Geen data beschikbaar.</PageWrapper>;
  }

  const total = allArtworks.length;
  const counts: Record<string, number> = allArtworks.reduce(
    (acc, art) => {
      acc[art.medium] = (acc[art.medium] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const first = [...allArtworks].sort((a, b) => a.year - b.year)[0];
  const last = [...allArtworks].sort((a, b) => b.year - a.year)[0];
  const firstLabel = first ? `${first.title} (${first.year})` : 'N/A';
  const lastLabel = last ? `${last.title} (${last.year})` : 'N/A';

  return (
    <PageWrapper>
      <h2>Statistieken</h2>
      <StatGrid>
        <StatCard>
          <StatTitle>Totaal aantal werken</StatTitle>
          <StatValue>{total}</StatValue>
        </StatCard>
        {Object.entries(counts).map(([cat, count]) => (
          <StatCard key={cat}>
            <StatTitle>{cat}</StatTitle>
            <StatValue>{count}</StatValue>
          </StatCard>
        ))}
        <StatCard>
          <StatTitle>Eerste werk</StatTitle>
          <StatValue>{firstLabel}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Laatste werk</StatTitle>
          <StatValue>{lastLabel}</StatValue>
        </StatCard>
      </StatGrid>
    </PageWrapper>
  );
}
