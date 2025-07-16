// src/components/AdminModal/components/DraftRecovery.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\DraftRecovery.tsx
import React from 'react';
import styled from 'styled-components';

interface DraftRecoveryProps {
  onLoadDraft: () => void;
  onClearDraft: () => void;
  onDismiss: () => void;
}

const DraftNotification = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DraftIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
`;

const DraftContent = styled.div`
  flex: 1;
`;

const DraftTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
`;

const DraftText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #92400e;
`;

const DraftActions = styled.div`
  display: flex;
  gap: 8px;
`;

const DraftButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ variant }) => variant === 'primary' ? `
    background-color: #f59e0b;
    color: white;
    
    &:hover {
      background-color: #d97706;
    }
  ` : `
    background-color: transparent;
    color: #92400e;
    border: 1px solid #f59e0b;
    
    &:hover {
      background-color: #fef3c7;
    }
  `}
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #92400e;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  line-height: 1;
  
  &:hover {
    color: #78350f;
  }
`;

export const DraftRecovery: React.FC<DraftRecoveryProps> = ({
  onLoadDraft,
  onClearDraft,
  onDismiss
}) => {
  return (
    <DraftNotification>
      <DraftIcon>
        💾
      </DraftIcon>
      <DraftContent>
        <DraftTitle>Concept gevonden</DraftTitle>
        <DraftText>
          Er is een automatisch opgeslagen concept van dit formulier beschikbaar.
        </DraftText>
      </DraftContent>
      <DraftActions>
        <DraftButton variant="primary" onClick={onLoadDraft}>
          Laden
        </DraftButton>
        <DraftButton variant="secondary" onClick={onClearDraft}>
          Verwijderen
        </DraftButton>
      </DraftActions>
      <CloseButton onClick={onDismiss}>
        ×
      </CloseButton>
    </DraftNotification>
  );
};
