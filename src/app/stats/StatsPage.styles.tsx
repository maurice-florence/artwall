import styled from 'styled-components';

export const PageWrapper = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
`;

export const StatCard = styled.div`
  background: ${({ theme }) => (theme && (theme as any).colors?.backgroundSecondary) || '#fff'};
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StatTitle = styled.h3`
  font-size: 1.1rem;
  color: ${({ theme }) => (theme && (theme as any).colors?.textSecondary) || '#666'};
  margin-bottom: 0.5rem;
`;

export const StatValue = styled.span`
  font-size: 2.2rem;
  font-weight: bold;
  color: ${({ theme }) => (theme && (theme as any).colors?.primary) || '#0070f3'};
`;
