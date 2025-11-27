// Removed alignment check line
// ...existing code...
// ...existing code...
import React, { useEffect, useState, useRef, useLayoutEffect, useMemo } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { formatDate } from '@/utils';
import { Artwork } from '@/types';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { getResizedImageUrl } from '@/utils/image-urls';
import Image from 'next/image';
import firebaseLoader from '../../lib/firebase-loader';

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
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding: 1.2rem 2rem;
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
    font-size: 1.1rem;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  @media (max-width: 600px) {
    padding: 0.8rem;
    max-width: 100vw;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
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

// (ShareButton removed - unused)

const LanguageSwitcher = styled.div`
  display: flex;
  gap: 0.5rem;
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
// Type guards for audio medium fields
function hasSoundcloudTrackUrl(artwork: Artwork): boolean {
  return artwork.medium === 'audio' && 'soundcloudTrackUrl' in artwork && typeof (artwork as any).soundcloudTrackUrl === 'string';
}
function hasLyrics(artwork: Artwork): boolean {
  return artwork.medium === 'audio' && 'lyrics' in artwork && typeof (artwork as any).lyrics === 'string';
}
function hasChords(artwork: Artwork): boolean {
  return artwork.medium === 'audio' && 'chords' in artwork && typeof (artwork as any).chords === 'string';
}
function hasMediaType(artwork: Artwork): boolean {
  return 'mediaType' in artwork && typeof (artwork as any).mediaType === 'string';
}

type ModalProps = {
  item: Artwork;
  onClose: () => void;
  onEdit?: (item: Artwork) => void;
  isAdmin?: boolean;
  isOpen?: boolean; // Make this optional
};

const Modal: React.FC<ModalProps> = ({ 
  item, 
  onClose, 
  onEdit, 
  isAdmin, 
  isOpen = true // Default to true since if Modal is rendered, it should be open
}) => {
  const dateObj = new Date(item.year, (item.month ?? 1) - 1, item.day ?? 1);
  const formattedDateStr = formatDate(dateObj);
  const router = useRouter();

  const [currentLanguage, setCurrentLanguage] = useState(item.language1 || 'en');
  // Add state for slider inside Modal component
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isStacked, setIsStacked] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Progressive image loading states
  const [imageLoadState, setImageLoadState] = useState<Record<number, 'loading' | 'loaded'>>({});
  const [fullSizeLoaded, setFullSizeLoaded] = useState<Record<number, boolean>>({});

  // Get available languages
  const availableLanguages = [];
  if (item.language1) availableLanguages.push(item.language1);
  if (item.language2) availableLanguages.push(item.language2);
  if (item.language3) availableLanguages.push(item.language3);
  // Helper to generate unique key for language tags
  const getLangKey = (lang: string, idx: number) => lang && lang.trim() !== '' ? lang : `empty-${idx}`;


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
  // Clean content: remove first two lines, last four lines, ensure first two are blank
  const cleanContent = (() => {
    let content = translation.content ? translation.content.replace(/---VERSION_\d+---/g, '') : '';
    if (!content) return '';
    let lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    // Remove title if it matches the first non-empty line
    if (lines.length && lines[0].trim().toLowerCase() === (translation.title || item.title || '').trim().toLowerCase()) {
      lines = lines.slice(1);
    }
    // Remove date and location if they match the last two lines
    const dateStr = formatDate(new Date(item.year, (item.month ?? 1) - 1, item.day ?? 1));
    const locationStr = item.location1 || '';
    if (lines.length >= 2) {
      const last = lines[lines.length - 1].trim();
      const secondLast = lines[lines.length - 2].trim();
      if ((last === locationStr || last === '') && (secondLast === dateStr || secondLast === '')) {
        lines = lines.slice(0, -2);
      } else if (last === locationStr || last === dateStr) {
        lines = lines.slice(0, -1);
      }
    }
    return lines.join('\n');
  })();

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
      const img = document.createElement('img');
      img.src = `https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/${hash}?alt=media`;
      img.alt = '';
      img.style.maxWidth = '100%';
      // Remove any text nodes that may follow the <img> (e.g. 'Media')
      if (tag.nextSibling && tag.nextSibling.nodeType === Node.TEXT_NODE && tag.nextSibling.textContent?.trim() === 'Media') {
        tag.parentNode?.removeChild(tag.nextSibling);
      }
      tag.replaceWith(img);
    });
        <div role="dialog" data-testid="modal">
          <MediaTextContainer>
            {translation.content && (
              <TextContainer
                ref={textContainerRef}
                data-testid="modal-content"
                style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: parseContent(cleanContent) }}
              />
            )}
            {allMedia.length > 0 && (
              <ImageContainer ref={imageContainerRef} style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                {isStacked ? (
                  allMedia.map((url, index) => {
                    const type = getMediaType(url);
                    if (type === 'image') {
                      const originalUrl = getResizedImageUrl(url, 'original');
                      return <ProgressiveImage key={index} src={url} alt={`Media ${index + 1}`} index={index} onClick={() => window.open(originalUrl, '_blank')} />;
                    }
                    if (type === 'video') return <video key={index} src={url} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} />;
                    if (type === 'audio') return <audio key={index} src={url} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} />;
                    if (type === 'pdf') return <PdfViewer key={index} src={url} title={`PDF ${index + 1}`} />;
                    return <div key={index}>Onbekend mediabestand</div>;
                  })
                ) : (
                  <>
                    {allMedia.length > 1 && (
                      <button
                        style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
                        onClick={ev => { ev.stopPropagation(); setCurrentMediaIndex((currentMediaIndex - 1 + allMedia.length) % allMedia.length); }}
                        aria-label="Previous media"
                      >&lt;</button>
                    )}
                    {(() => {
                      const currentUrl = allMedia[currentMediaIndex];
                      const type = getMediaType(currentUrl);
                      if (type === 'image') {
                        const originalUrl = getResizedImageUrl(currentUrl, 'original');
                        return (
                          <div data-testid={`modal-media-image-${currentMediaIndex}`}>
                            <ProgressiveImage 
                              src={currentUrl} 
                              alt={`Media ${currentMediaIndex + 1}`} 
                              index={currentMediaIndex}
                              onClick={() => window.open(originalUrl, '_blank')} 
                            />
                          </div>
                        );
                      }
                      if (type === 'video') return <video src={currentUrl} controls style={{ width: '100%', maxHeight: '70vh', borderRadius: 4, background: '#222' }} data-testid={`modal-media-video-${currentMediaIndex}`} />;
                      if (type === 'audio') return <audio src={currentUrl} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} data-testid={`modal-media-audio-${currentMediaIndex}`} />;
                      if (type === 'pdf') return <iframe src={currentUrl} style={{ width: '100%', height: '70vh', border: '1px solid #ddd', borderRadius: 4 }} title={`PDF ${currentMediaIndex + 1}`} data-testid={`modal-media-pdf-${currentMediaIndex}`} />;
                      return <div style={{ width: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 16 }}><span>Onbekend mediabestand</span></div>;
                    })()}
                    {allMedia.length > 1 && (
                      <button
                        style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
                        onClick={ev => { ev.stopPropagation(); setCurrentMediaIndex((currentMediaIndex + 1) % allMedia.length); }}
                        aria-label="Next media"
                      >&gt;</button>
                    )}
                    {allMedia.length > 1 && (
                      <span style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 14, color: '#fff', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0 8px' }}>{currentMediaIndex + 1}/{allMedia.length}</span>
                    )}
                  </>
                )}
              </ImageContainer>
            )}
            {/* Footer for date and location */}
            <div style={{marginTop: '2rem', fontStyle: 'italic', color: '#444', fontSize: '1rem', width: '100%'}}>
              {item.day && item.month && item.year && (
                <span>{formatDate(new Date(item.year, (item.month ?? 1) - 1, item.day ?? 1))}</span>
              )}
              {item.location1 && (
                <span>{item.day && item.month && item.year ? ' — ' : ''}{item.location1}</span>
              )}
            </div>
          </MediaTextContainer>
        </div>
              {allMedia.length > 0 && (
                <ImageContainer ref={imageContainerRef} style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                  {isStacked ? (
                    allMedia.map((url, index) => {
                      const type = getMediaType(url);
                      if (type === 'image') {
                        const originalUrl = getResizedImageUrl(url, 'original');
                        return <ProgressiveImage key={index} src={url} alt={`Media ${index + 1}`} index={index} onClick={() => window.open(originalUrl, '_blank')} />;
                      }
                      if (type === 'video') return <video key={index} src={url} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} />;
                      if (type === 'audio') return <audio key={index} src={url} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} />;
                      if (type === 'pdf') return <PdfViewer key={index} src={url} title={`PDF ${index + 1}`} />;
                      return <div key={index}>Onbekend mediabestand</div>;
                    })
                  ) : (
                    <>
                      {allMedia.length > 1 && (
                        <button
                          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
                          onClick={ev => { ev.stopPropagation(); setCurrentMediaIndex((currentMediaIndex - 1 + allMedia.length) % allMedia.length); }}
                          aria-label="Previous media"
                        >&lt;</button>
                      )}
                      {(() => {
                        const currentUrl = allMedia[currentMediaIndex];
                        const type = getMediaType(currentUrl);
                        if (type === 'image') {
                          const originalUrl = getResizedImageUrl(currentUrl, 'original');
                          return (
                            <div data-testid={`modal-media-image-${currentMediaIndex}`}>
                              <ProgressiveImage 
                                src={currentUrl} 
                                alt={`Media ${currentMediaIndex + 1}`} 
                                index={currentMediaIndex}
                                onClick={() => window.open(originalUrl, '_blank')} 
                              />
                            </div>
                          );
                        } else if (type === 'video') {
                          return <video src={currentUrl} controls style={{ width: '100%', maxHeight: '70vh', borderRadius: 4, background: '#222' }} data-testid={`modal-media-video-${currentMediaIndex}`} />;
                        } else if (type === 'audio') {
                          return <audio src={currentUrl} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} data-testid={`modal-media-audio-${currentMediaIndex}`} />;
                        } else if (type === 'pdf') {
                          return <iframe src={currentUrl} style={{ width: '100%', height: '70vh', border: '1px solid #ddd', borderRadius: 4 }} title={`PDF ${currentMediaIndex + 1}`} data-testid={`modal-media-pdf-${currentMediaIndex}`} />;
                        }
                        return <div style={{ width: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 16 }}><span>Onbekend mediabestand</span></div>;
                      })()}
                      {allMedia.length > 1 && (
                        <button
                          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
                          onClick={ev => { ev.stopPropagation(); setCurrentMediaIndex((currentMediaIndex + 1) % allMedia.length); }}
                          aria-label="Next media"
                        >&gt;</button>
                      )}
                      {allMedia.length > 1 && (
                        <span style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 14, color: '#fff', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0 8px' }}>{currentMediaIndex + 1}/{allMedia.length}</span>
                      )}
                    </>
                  )}
                </ImageContainer>
              )}
              {translation.content && (
                <TextContainer
                  ref={textContainerRef}
                  data-testid="modal-content"
                  style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: parseContent(cleanContent) }}
                />
              )}
            </MediaTextContainer>
          ) : (
            <MediaTextContainer>
              {translation.content && (
                <TextContainer
                  ref={textContainerRef}
                  data-testid="modal-content"
                  style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}
                  dangerouslySetInnerHTML={{ __html: parseContent(cleanContent) }}
                />
              )}
              {allMedia.length > 0 && (
                <ImageContainer ref={imageContainerRef} style={{ position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
                  {isStacked ? (
                    allMedia.map((url, index) => {
                      const type = getMediaType(url);
                      if (type === 'image') {
                        const originalUrl = getResizedImageUrl(url, 'original');
                        return <ProgressiveImage key={index} src={url} alt={`Media ${index + 1}`} index={index} onClick={() => window.open(originalUrl, '_blank')} />;
                      }
                      if (type === 'video') return <video key={index} src={url} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} />;
                      if (type === 'audio') return <audio key={index} src={url} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} />;
                      if (type === 'pdf') return <PdfViewer key={index} src={url} title={`PDF ${index + 1}`} />;
                      return <div key={index}>Onbekend mediabestand</div>;
                    })
                  ) : (
                    <>
                      {allMedia.length > 1 && (
                        <button
                          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
                          onClick={ev => { ev.stopPropagation(); setCurrentMediaIndex((currentMediaIndex - 1 + allMedia.length) % allMedia.length); }}
                          aria-label="Previous media"
                        >&lt;</button>
                      )}
                      {(() => {
                        const currentUrl = allMedia[currentMediaIndex];
                        const type = getMediaType(currentUrl);
                        if (type === 'image') {
                          const originalUrl = getResizedImageUrl(currentUrl, 'original');
                          return (
                            <div data-testid={`modal-media-image-${currentMediaIndex}`}>
                              <ProgressiveImage 
                                src={currentUrl} 
                                alt={`Media ${currentMediaIndex + 1}`} 
                                index={currentMediaIndex}
                                onClick={() => window.open(originalUrl, '_blank')} 
                              />
                            </div>
                          );
                        }
                        if (type === 'video') return <video src={currentUrl} controls style={{ width: '100%', maxHeight: '70vh', borderRadius: 4, background: '#222' }} data-testid={`modal-media-video-${currentMediaIndex}`} />;
                        if (type === 'audio') return <audio src={currentUrl} controls style={{ width: '100%', borderRadius: 4, background: '#222' }} data-testid={`modal-media-audio-${currentMediaIndex}`} />;
                        if (type === 'pdf') return <iframe src={currentUrl} style={{ width: '100%', height: '70vh', border: '1px solid #ddd', borderRadius: 4 }} title={`PDF ${currentMediaIndex + 1}`} data-testid={`modal-media-pdf-${currentMediaIndex}`} />;
                        return <div style={{ width: '100%', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 16 }}><span>Onbekend mediabestand</span></div>;
                      })()}
                      {allMedia.length > 1 && (
                        <button
                          style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', zIndex: 2 }}
                          onClick={ev => { ev.stopPropagation(); setCurrentMediaIndex((currentMediaIndex + 1) % allMedia.length); }}
                          aria-label="Next media"
                        >&gt;</button>
                      )}
                      {allMedia.length > 1 && (
                        <span style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 14, color: '#fff', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '0 8px' }}>{currentMediaIndex + 1}/{allMedia.length}</span>
                      )}
                    </>
                  )}
                </ImageContainer>
              )}
            </MediaTextContainer>
          )}
        </div>
      </ModalContent>
    </ModalBackdrop>,
    document.body
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