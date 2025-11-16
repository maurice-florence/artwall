import { useEffect, useState } from 'react';
import { breakpoints } from '../styles/breakpoints';

// Simple hook to detect mobile viewport width. Updates on resize.
export function useIsMobile(initial?: boolean): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(initial ?? (typeof window !== 'undefined' ? window.innerWidth < breakpoints.md : true));

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoints.md);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default useIsMobile;
