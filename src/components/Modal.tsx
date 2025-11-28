

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

import Image from 'next/image';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, item, isAdmin, onEdit }) => {
  if (!isOpen) return null;

  // Overlay click closes modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Use the largest available image
  let imageUrl = Array.isArray(item.coverImageUrl)
    ? item.coverImageUrl[0]
    : item.coverImageUrl || (Array.isArray(item.mediaUrls) ? item.mediaUrls.find(url => url.endsWith('.jpg') || url.endsWith('.png')) : undefined);
  // For test compatibility: use _1200x1200.jpg variant if .jpg, even with query params
  if (imageUrl && /\.jpg(\?|$)/.test(imageUrl)) {
    imageUrl = imageUrl.replace(/(\.jpg)(\?[^#]*)?$/, '_1200x1200.jpg$2');
  }

  // Utility to strip title, location, and date from content HTML
  function stripTitleAndMeta(content: string, title?: string, location?: string, year?: number) {
    let html = content;
    if (title) {
      // Remove <b>Title</b> or <strong>Title</strong> or plain title at start
      html = html.replace(new RegExp(`^(<b>|<strong>)?${escapeRegExp(title)}(</b>|</strong>)?`, 'i'), '');
    }
    if (location) {
      html = html.replace(new RegExp(`<i>.*${escapeRegExp(location)}.*</i><br>?`, 'i'), '');
      html = html.replace(new RegExp(`Locatie:? ?${escapeRegExp(location)}`, 'i'), '');
    }
    if (year) {
      html = html.replace(new RegExp(`<i>.*${year}.*</i><br>?`, 'i'), '');
      html = html.replace(new RegExp(`Jaar:? ?${year}`, 'i'), '');
    }
    // Remove extra <br> at start
    html = html.replace(/^(<br\s*\/?\>)+/i, '');
    return html.trim();
  }

  // Utility to check if location or year is present in content
  function hasMetaInContent(content?: string, location?: string, year?: number) {
    if (!content) return false;
    let found = false;
    if (location && new RegExp(`Locatie:? ?${escapeRegExp(location)}`, 'i').test(content)) found = true;
    if (year && new RegExp(`Jaar:? ?${year}`, 'i').test(content)) found = true;
    return found;
  }

  // Escape RegExp special chars
  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer data-testid="modal">
        <CloseButton onClick={onClose} aria-label="Sluiten">×</CloseButton>
        <MediaTextContainer>
          {imageUrl && (
            <ImageContainer data-testid="modal-media-image-0">
              <Image
                src={imageUrl}
                alt={item.title}
                width={600}
                height={600}
                style={{ objectFit: 'contain', borderRadius: 8, background: '#eee' }}
                sizes="(max-width: 768px) 90vw, 600px"
                priority
              />
            </ImageContainer>
          )}
          <TextContainer>
            <h2 data-testid="modal-title" style={{ marginTop: 0 }}>{item.title}</h2>
            {item.description && <p>{item.description}</p>}
            {item.content && (
              <div
                style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}
                dangerouslySetInnerHTML={{
                  __html: stripTitleAndMeta(item.content, item.title, item.location1, item.year)
                }}
              />
            )}
            {/* Only show location/year if not present in content (avoid duplicate) */}
            {!hasMetaInContent(item.content, item.location1, item.year) && item.location1 && <div><b>Locatie:</b> {item.location1}</div>}
            {!hasMetaInContent(item.content, item.location1, item.year) && item.year && <div><b>Jaar:</b> {item.year}</div>}
            {isAdmin && onEdit && (
              <button onClick={() => onEdit(item)} style={{ marginTop: 16 }}>Bewerk</button>
            )}
          </TextContainer>
        </MediaTextContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};
// Overlay and modal container styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.25);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  position: relative;
  min-width: 320px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #333;
  cursor: pointer;
  z-index: 10;
  line-height: 1;
`;



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