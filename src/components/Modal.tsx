import React, { useState } from 'react';
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

const LanguageSwitcher = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const LanguageButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) => $active ? theme.accent : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.accentText : theme.text};
  border: 1px solid ${({ theme }) => theme.accent};
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: ${({ theme }) => theme.accentText};
  }
`;

// Only use window in client-side code
const isClient = typeof window !== 'undefined';
const isMobile = isClient ? window.innerWidth < 768 : false;

// Type guards for union type fields
function hasSoundcloudTrackUrl(artwork: Artwork): artwork is import("@/types").MusicArtwork {
  return 'soundcloudTrackUrl' in artwork && typeof (artwork as any).soundcloudTrackUrl === 'string';
}
function hasLyrics(artwork: Artwork): artwork is import("@/types").MusicArtwork {
  return 'lyrics' in artwork && typeof (artwork as any).lyrics === 'string';
}
function hasChords(artwork: Artwork): artwork is import("@/types").MusicArtwork {
  return 'chords' in artwork && typeof (artwork as any).chords === 'string';
}
function hasMediaType(artwork: Artwork): artwork is (import("@/types").MusicArtwork | import("@/types").VisualArtArtwork | import("@/types").VideoArtwork | import("@/types").PoetryArtwork) {
  return 'mediaType' in artwork && typeof (artwork as any).mediaType === 'string';
}

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

  const [currentLanguage, setCurrentLanguage] = useState(item.language1 || 'en');

  // Get available languages
  const availableLanguages = [];
  if (item.language1) availableLanguages.push(item.language1);
  if (item.language2) availableLanguages.push(item.language2);
  if (item.language3) availableLanguages.push(item.language3);

  // Get current translation
  const getCurrentTranslation = () => {
    if (currentLanguage === item.language1) {
      return {
        title: item.title,
        description: item.description,
        content: item.content || '',
        lyrics: item.lyrics || '',
      };
    }

    return item.translations?.[currentLanguage] || {
      title: item.title,
      description: item.description,
      content: item.content || '',
      lyrics: item.lyrics || '',
    };
  };

  const translation = getCurrentTranslation();

  const handleClose = () => {
    setCurrentLanguage(item.language1 || 'en');
    onClose();
  };

  // Function to replace <en-media> tags with <img> tags
  const parseContent = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Replace <en-media> tags with <img> tags
    const mediaTags = doc.querySelectorAll('en-media');
    mediaTags.forEach((tag) => {
      const hash = tag.getAttribute('hash');
      const type = tag.getAttribute('type');
      const img = document.createElement('img');
      img.src = `https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/${hash}?alt=media`;
      img.alt = 'Media';
      img.style.maxWidth = '100%';
      tag.replaceWith(img);
    });

    return doc.body.innerHTML;
  };

  return (
    <ModalBackdrop onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} aria-label="Sluit modal">
          <FaTimes />
        </CloseButton>
        <h2>{translation.title}</h2>
        <p style={{ marginTop: '0.25rem', opacity: 0.8 }}>({formattedDateStr})</p>

        {/* Language Switcher */}
        {availableLanguages.length > 1 && (
          <LanguageSwitcher>
            {availableLanguages.map((lang) => (
              <LanguageButton
                key={lang}
                $active={currentLanguage === lang}
                onClick={() => setCurrentLanguage(lang)}
              >
                {lang.toUpperCase()}
              </LanguageButton>
            ))}
          </LanguageSwitcher>
        )}

        <StyledHr />

        <MediaTextContainer>
          {/* Display content for all categories */}
          {translation.content && (
            <TextContainer
              style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: parseContent(translation.content) }}
            />
          )}

          {/* Display lower-resolution cover image */}
          {item.coverImageUrl && (
            <ImageContainer>
              <ResponsiveImage
                src={item.coverImageUrl}
                alt="Cover Image"
                style={{ maxWidth: '300px', maxHeight: '300px' }} // Lower resolution for faster loading
                onClick={() => window.open(item.coverImageUrl, '_blank')} // Open full resolution on click
              />
            </ImageContainer>
          )}

          {/* Display additional media */}
          {item.mediaUrls && item.mediaUrls.length > 0 && (
            <ImageContainer>
              {item.mediaUrls.map((url, index) => (
                <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                  <ResponsiveImage src={url} alt={`Media ${index + 1}`} />
                </a>
              ))}
            </ImageContainer>
          )}
        </MediaTextContainer>
      </ModalContent>
    </ModalBackdrop>
  );
};

// Styled components for layout
const MediaTextContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
`;

const TextContainer = styled.div`
  flex: 1;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResponsiveImage = styled.img`
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  cursor: pointer;
  border-radius: 4px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

export default Modal;
