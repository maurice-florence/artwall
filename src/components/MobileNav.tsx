import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import useIsMobile from '@/hooks/useIsMobile';
import { Artwork } from '@/types';

const Button = styled.button`
  background: ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.headerText};
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  &:active { transform: scale(0.95); }
`;

interface MobileNavProps {
  artworks: Artwork[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ artworks }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  if (!isMobile) return null;
  return (
    <>
      <Button aria-label="Open navigation" onClick={() => setOpen(true)} data-testid="mobile-nav-button">
        <FaBars />
      </Button>
      <Sidebar isOpen={open} allArtworks={artworks} onClose={() => setOpen(false)} />
    </>
  );
};

export default MobileNav;
