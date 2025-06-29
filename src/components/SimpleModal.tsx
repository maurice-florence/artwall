import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(61, 64, 91, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.cardText};
  padding: 2rem 3rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.cardText};
  cursor: pointer;
  line-height: 1;
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.2);
  }
`;

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Sluit modal">
          <FaTimes />
        </CloseButton>
        {children}
      </ModalContent>
    </ModalBackdrop>
  );
};

export default SimpleModal;
