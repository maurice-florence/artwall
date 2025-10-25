import { useState, useCallback, useEffect, RefObject } from 'react';

/**
 * A reusable hook for managing dropdown open/close state with animations.
 * Handles click-outside detection and keyboard (Escape) events.
 */
export function useDropdown(ref: RefObject<HTMLElement | null>) {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const close = useCallback(() => {
    if (!isMounted) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setIsMounted(false);
      setIsClosing(false);
    }, 180); // Match animation duration
  }, [isMounted]);

  const toggle = useCallback(() => {
    if (!isMounted) {
      setIsMounted(true);
      setIsClosing(false);
    } else {
      close();
    }
  }, [isMounted, close]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isMounted) return;
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        close();
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    if (isMounted) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('mousedown', handleDocumentClick);
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  }, [isMounted, ref, close]);

  return { isMounted, isClosing, toggle, close };
}
