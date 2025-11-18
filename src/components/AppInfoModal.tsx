import React from 'react';
import styled from 'styled-components';
import { FaInfoCircle } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 90vw;
  color: #222;
  font-size: 1rem;
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
`;

const InfoRow = styled.div`
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

export interface AppInfoModalProps {
  open: boolean;
  onClose: () => void;
  version: string;
  commit: string;
  extraInfo?: React.ReactNode;
}

const AppInfoModal: React.FC<AppInfoModalProps> = ({ open, onClose, version, commit, extraInfo }) => {
  if (!open) return null;
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} title="Sluiten" aria-label="Sluiten">×</CloseButton>
        <InfoRow>
          <FaInfoCircle size={24} style={{ color: '#0b8783' }} />
          <span style={{ fontWeight: 600, fontSize: '1.15rem' }}>App Informatie</span>
        </InfoRow>
        <InfoRow>
          <strong>Versie:</strong> <span>v{version}</span>
        </InfoRow>
        {commit && (
          <InfoRow>
            <strong>Commit:</strong> <span>{commit.slice(0,7)}</span>
          </InfoRow>
        )}
        {extraInfo}
      </ModalContent>
    </ModalOverlay>
  );
};

export default AppInfoModal;
