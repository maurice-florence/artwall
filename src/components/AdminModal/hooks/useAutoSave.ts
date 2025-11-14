// src/components/AdminModal/hooks/useAutoSave.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\hooks\useAutoSave.ts
import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { ArtworkFormData } from '@/types';

interface AutoSaveOptions {
  delay?: number;
  key?: string;
  enabled?: boolean;
}

export const useAutoSave = (
  formData: ArtworkFormData,
  options: AutoSaveOptions = {}
) => {
  const {
    delay = 2000,
    key = 'artwall-form-draft',
    enabled = true
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>('');

  const saveDraft = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    const dataString = JSON.stringify(formData);
    if (dataString === lastSavedRef.current) return;

    try {
      localStorage.setItem(key, dataString);
      lastSavedRef.current = dataString;
  logger.info('Draft saved:', new Date().toLocaleTimeString());
    } catch (error) {
  logger.warn('Failed to save draft:', error);
    }
  }, [formData, key, enabled]);

  const loadDraft = useCallback((): ArtworkFormData | null => {
    if (!enabled || typeof window === 'undefined') return null;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
  logger.info('Draft loaded:', new Date().toLocaleTimeString());
        return parsedData;
      }
    } catch (error) {
  logger.warn('Failed to load draft:', error);
    }
    return null;
  }, [key, enabled]);

  const clearDraft = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
      lastSavedRef.current = '';
  logger.info('Draft cleared');
    } catch (error) {
  logger.warn('Failed to clear draft:', error);
    }
  }, [key, enabled]);

  const hasDraft = useCallback((): boolean => {
    if (!enabled || typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  }, [key, enabled]);

  // Auto-save with debounce
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, delay, saveDraft, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadDraft,
    clearDraft,
    hasDraft,
    saveDraft: () => saveDraft()
  };
};
