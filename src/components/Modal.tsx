
import styled from 'styled-components';

const Modal = () => {
  return null;
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