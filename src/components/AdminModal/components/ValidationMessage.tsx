// src/components/AdminModal/components/ValidationMessage.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\ValidationMessage.tsx
import React from 'react';
import styled from 'styled-components';

interface ValidationMessageProps {
  type: 'error' | 'warning' | 'success';
  message: string;
  field?: string;
}

const MessageContainer = styled.div<{ type: 'error' | 'warning' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 4px;
  
  ${({ type }) => {
    switch (type) {
      case 'error':
        return `
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
        `;
      case 'warning':
        return `
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          color: #d97706;
        `;
      case 'success':
        return `
          background-color: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        `;
      default:
        return '';
    }
  }}
`;

const Icon = styled.span<{ type: 'error' | 'warning' | 'success' }>`
  font-size: 16px;
  
  ${({ type }) => {
    switch (type) {
      case 'error':
        return 'color: #dc2626;';
      case 'warning':
        return 'color: #d97706;';
      case 'success':
        return 'color: #16a34a;';
      default:
        return '';
    }
  }}
`;

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  field
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '';
    }
  };

  return (
    <MessageContainer type={type} role="alert" aria-live="polite">
      <Icon type={type}>{getIcon()}</Icon>
      <span>{message}</span>
    </MessageContainer>
  );
};

export default ValidationMessage;