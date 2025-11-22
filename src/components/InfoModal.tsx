import React from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  color: #222;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  &:hover { color: #0b8783; }
`;

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  commit: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, version, commit }) => {
  if (!isOpen) return null;
  return (
    <ModalBackdrop onClick={onClose} data-testid="info-modal-backdrop">
      <ModalContent onClick={e => e.stopPropagation()} data-testid="info-modal-content">
        <CloseButton onClick={onClose} aria-label="Close info modal">×</CloseButton>
        <h2>App Info</h2>
        <p><strong>Version:</strong> {version}</p>
        <p><strong>Commit:</strong> {commit ? commit.slice(0, 12) : 'N/A'}</p>
        <p><strong>Framework:</strong> Next.js</p>
        <p><strong>Created by:</strong> Johannes</p>
        <p style={{fontSize: '0.95em', color: '#888', marginTop: '2em'}}>For more details, see the README or repository.</p>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default InfoModal;
