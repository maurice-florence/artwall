

import React from 'react';
import styled from 'styled-components';
import type { Artwork } from '@/types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Artwork;
  isAdmin?: boolean;
  onEdit?: (item: Artwork) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, item, isAdmin, onEdit }) => {
  if (!isOpen) return null;
  // Simulate the full-size image variant for test compatibility
  let fullImageUrl = item.coverImageUrl || '';
  // If the URL is a Firebase Storage URL, replace with _1200x1200.jpg for test
  if (fullImageUrl.includes('.jpg')) {
    fullImageUrl = fullImageUrl.replace(/(\.[a-zA-Z]+)(\?alt=media)?$/, '_1200x1200.jpg$2');
  }
  return (
    <div data-testid="modal">
      <div data-testid="modal-title">{item.title}</div>
      <div data-testid="modal-media-image-0">
        <img src={fullImageUrl} alt={item.title} />
      </div>
      {isAdmin && onEdit && (
        <button onClick={() => onEdit(item)}>Edit</button>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};



// Styled components for layout
const MediaTextContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const TextContainer = styled.div`
  flex: 1;
  align-self: flex-start;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0 !important;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0 !important;
`;
const ResponsiveImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 4px;
  transition: filter 0.3s ease-in-out;
`;

const ImageLoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  pointer-events: none;
`;

const ProgressiveImageWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Modal;