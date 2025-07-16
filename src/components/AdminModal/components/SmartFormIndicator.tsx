// src/components/AdminModal/components/SmartFormIndicator.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\SmartFormIndicator.tsx
import React from 'react';
import styled from 'styled-components';
import { SmartFormState } from '../hooks/useSmartFormLogic';

const IndicatorContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.body};
  border-bottom: 1px solid ${({ theme }) => theme.border || '#d1d5db'};
  padding: 0.75rem 1rem;
  margin: -1rem -1rem 1rem -1rem;
`;

const IndicatorContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
`;

const ProgressSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 4px;
  background: ${({ theme }) => theme.border || '#d1d5db'};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: ${({ theme }) => theme.primary};
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusBadge = styled.div<{ type: 'success' | 'warning' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  
  ${({ type, theme }) => {
    switch (type) {
      case 'success':
        return `
          background: #22c55e20;
          color: #22c55e;
        `;
      case 'warning':
        return `
          background: #f59e0b20;
          color: #f59e0b;
        `;
      case 'error':
        return `
          background: #ef444420;
          color: #ef4444;
        `;
    }
  }}
`;

const SmartBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${({ theme }) => theme.primary}20;
  color: ${({ theme }) => theme.primary};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const NextFieldHint = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary || '#6b7280'};
`;

interface SmartFormIndicatorProps {
  smartState: SmartFormState;
  nextSuggestedField: string | null;
  totalFields: number;
  completedFields: number;
}

export const SmartFormIndicator: React.FC<SmartFormIndicatorProps> = ({
  smartState,
  nextSuggestedField,
  totalFields,
  completedFields
}) => {
  const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const hasErrors = smartState.smartValidation.errors.length > 0;
  const hasWarnings = smartState.smartValidation.warnings.length > 0;

  return (
    <IndicatorContainer>
      <IndicatorContent>
        <ProgressSection>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
          <span>{completedFields}/{totalFields}</span>
        </ProgressSection>

        <StatusSection>
          <SmartBadge>
            <span>🧠</span>
            Smart Form
          </SmartBadge>

          {hasErrors && (
            <StatusBadge type="error">
              <span>⚠️</span>
              {smartState.smartValidation.errors.length} errors
            </StatusBadge>
          )}

          {hasWarnings && (
            <StatusBadge type="warning">
              <span>⚡</span>
              {smartState.smartValidation.warnings.length} warnings
            </StatusBadge>
          )}

          {!hasErrors && !hasWarnings && progress === 100 && (
            <StatusBadge type="success">
              <span>✅</span>
              Complete
            </StatusBadge>
          )}
        </StatusSection>
      </IndicatorContent>

      {nextSuggestedField && !hasErrors && (
        <NextFieldHint>
          💡 Next: {nextSuggestedField}
        </NextFieldHint>
      )}
    </IndicatorContainer>
  );
};
