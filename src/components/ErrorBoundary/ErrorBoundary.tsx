// src/components/ErrorBoundary/ErrorBoundary.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\ErrorBoundary\ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 2rem;
  text-align: center;
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  margin: 1rem;
`;

const ErrorTitle = styled.h2`
  color: #e74c3c;
  margin-bottom: 1rem;
`;

const RefreshButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #E07A5F;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #d66a4a;
  }
`;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Er is iets misgegaan</ErrorTitle>
          <p>Probeer de pagina te verversen of neem contact op als het probleem blijft bestaan.</p>
          <RefreshButton onClick={this.handleRefresh}>
            Pagina verversen
          </RefreshButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}