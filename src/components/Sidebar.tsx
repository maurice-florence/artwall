
import React from 'react';
import { Artwork } from '@/types';
import styled from 'styled-components';
import useIsMobile from '@/hooks/useIsMobile';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  z-index: 999;
`;

const Drawer = styled.aside`
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  width: 280px;
  max-width: 85vw;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: 2px 0 12px rgba(0,0,0,0.15);
  animation: slideIn 240ms ease;
  @keyframes slideIn {
    from { transform: translateX(-40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const CloseHitArea = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  &:hover { background: rgba(0,0,0,0.05); }
`;

interface SidebarProps {
  isOpen: boolean;
  allArtworks: Artwork[];
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, allArtworks, onClose }) => {
  const isMobile = useIsMobile();
  if (!isOpen) return null;
  // Mobile: render overlay + drawer; Desktop: simple inline panel (future enhancement)
  if (isMobile) {
    return (
      <Overlay data-testid="sidebar-overlay" onClick={onClose} role="dialog" aria-label="Sidebar navigation">
        <Drawer onClick={(e) => e.stopPropagation()} data-testid="sidebar">
          <CloseHitArea aria-label="Close sidebar" onClick={onClose}>×</CloseHitArea>
          {allArtworks.map(artwork => (
            <div key={artwork.id} data-testid={`artwork-title-${artwork.id}`}>{artwork.title}</div>
          ))}
        </Drawer>
      </Overlay>
    );
  }
  return (
    <div data-testid="sidebar" style={{ position: 'sticky', top: 0 }}>
      {allArtworks.map(artwork => (
        <div key={artwork.id} data-testid={`artwork-title-${artwork.id}`}>{artwork.title}</div>
      ))}
    </div>
  );
};

export default Sidebar;
