import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Artwork } from '@/types';

const StatsContainer = styled.div`
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text};
`;

const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
`;

interface StatSummaryProps {
    allArtworks: Artwork[];
}

const StatSummary = ({ allArtworks }: StatSummaryProps) => {
    const stats = useMemo(() => {
        const counts = allArtworks.reduce((acc, art) => {
            acc[art.category] = (acc[art.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: allArtworks.length,
            counts
        };
    }, [allArtworks]);

    return (
        <StatsContainer>
            <StatRow>
                <strong>Totaal:</strong>
                <span>{stats.total}</span>
            </StatRow>
            {Object.entries(stats.counts).map(([category, count]) => (
                <StatRow key={category}>
                    <span>{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                    <span>{count}</span>
                </StatRow>
            ))}
        </StatsContainer>
    );
};

export default StatSummary;
