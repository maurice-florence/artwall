'use client';

import { useState, useEffect, ReactNode } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

interface MasonryWrapperProps {
  children: ReactNode;
  breakpoints?: { [key: number]: number };
}

export default function MasonryWrapper({
  children,
  breakpoints = { 350: 2, 750: 4, 900: 6, 1200: 8 },
}: MasonryWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
      <Masonry gutter="4px">
        {children}
      </Masonry>
    </ResponsiveMasonry>
  );
}
