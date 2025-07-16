// src/components/AdminModal/hooks/useLoadingState.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useLoadingState.ts
import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  loadingField?: string;
  progress?: number;
  error?: string;
}

export const useLoadingState = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false
  });

  const setLoading = useCallback((field?: string, progress?: number) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: true,
      loadingField: field,
      progress,
      error: undefined
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      error
    }));
  }, []);

  const clearLoading = useCallback(() => {
    setLoadingState({
      isLoading: false
    });
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress
    }));
  }, []);

  return {
    loadingState,
    setLoading,
    setError,
    clearLoading,
    updateProgress,
    isFieldLoading: (field: string) => loadingState.isLoading && loadingState.loadingField === field
  };
};
