
import React from 'react';
import { Artwork } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  allArtworks: Artwork[];
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, allArtworks, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div data-testid="sidebar">
      {allArtworks.map(artwork => (
        <div key={artwork.id} data-testid={`artwork-title-${artwork.id}`}>
          {artwork.title}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
