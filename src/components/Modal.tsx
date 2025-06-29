import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaSoundcloud, FaShareAlt, FaTrash } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '@/utils';
import { Artwork } from '@/types';
import { useRouter } from 'next/navigation';

const ModalBackdrop = styled.div.attrs({
  role: 'dialog',
  'aria-modal': true,
  'aria-label': 'Kunstwerk details',
})`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(61, 64, 91, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.cardBg};
  color: ${({ theme }) => theme.cardText};
  padding: 2rem 3rem;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  h2 {
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 600px) {
    padding: 1rem;
    max-width: 100vw;
    max-height: 95vh;
  }
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

const MediaContainer = styled.div`
  width: 100%;
  margin-top: 1.5rem;
`;

const ModalImage = styled.img`
  width: 100%;
  height: auto;
  max-height: calc(85vh - 200px);
  object-fit: contain;
  border-radius: 4px;
`;

const PdfViewer = styled.iframe`
  width: 100%;
  height: 70vh;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SoundCloudEmbed = styled.iframe`
  width: 100%;
  height: 166px;
  border: none;
  border-radius: 4px;
`;

const SoundCloudLinkButton = styled.a`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #ff5500;
  color: white;
  text-decoration: none;
  font-weight: bold;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cc4400;
  }
`;

const LyricsChordsSection = styled.div`
  background: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  white-space: pre-wrap;
  font-family: monospace;
  max-height: 30vh;
  overflow-y: auto;
`;

const StyledHr = styled.hr`
  border: none;
  border-top: 1px solid #dddddd;
  margin: 1.5rem 0;
`;

const ShareButton = styled.button`
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 2;

  &:hover {
    color: ${({ theme }) => theme.accentText};
  }
`;

// Only use window in client-side code
const isClient = typeof window !== 'undefined';
const isMobile = isClient ? window.innerWidth < 768 : false;

type ModalProps = {
  item: Artwork;
  onClose: () => void;
  onEdit?: (item: Artwork) => void;
  isAdmin?: boolean;
};

const Modal: React.FC<ModalProps> = ({ item, onClose, onEdit, isAdmin }) => {
  const dateObj = new Date(item.year, (item.month ?? 1) - 1, item.day ?? 1);
  const formattedDateStr = formatDate(dateObj);
  const router = useRouter();

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link gekopieerd!');
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Sluit modal">
          <FaTimes />
        </CloseButton>
        <h2>{item.title}</h2>
        <p style={{ marginTop: '0.25rem', opacity: 0.8 }}>({formattedDateStr})</p>
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{item.description}</p>
        <StyledHr />

        <MediaContainer>
          {item.category === 'proza' && item.coverImageUrl && (
            <ModalImage src={item.coverImageUrl} alt={`Cover voor ${item.title}`} style={{ marginBottom: '1rem' }} />
          )}
          {(item.category === 'poëzie' || item.category === 'prozapoëzie') && item.content && (
            <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
          )}
          {/* Add more media rendering as needed */}
        </MediaContainer>

        {item.soundcloudTrackUrl && (
          <SoundCloudLinkButton
            href={item.soundcloudTrackUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSoundcloud size="1.5em" />
            <span>Luister op SoundCloud</span>
          </SoundCloudLinkButton>
        )}

        {item.lyrics && (
          <LyricsChordsSection>
            <h3>Songtekst / Extra Tekst</h3>
            <ReactMarkdown>{item.lyrics}</ReactMarkdown>
          </LyricsChordsSection>
        )}
        {item.chords && item.mediaType !== 'audio' && (
          <LyricsChordsSection>
            <h3>Akkoorden / Notities</h3>
            <p>{item.chords}</p>
          </LyricsChordsSection>
        )}

        {isAdmin && item.id && onEdit && (
          <button
            style={{
              marginTop: 16,
              alignSelf: 'flex-end',
              background: '#E07A5F',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1.2rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => onEdit(item)}
          >
            Bewerken
          </button>
        )}
        {/* Place the share button at the bottom left */}
        <ShareButton onClick={handleShare} title="Deel deze kaart">
          <FaShareAlt />
        </ShareButton>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default Modal;
