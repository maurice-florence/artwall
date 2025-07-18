"use client";

import React from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import { db } from "@/firebase";
import { ref, get } from "firebase/database";
import { formatDate } from "@/utils";
import { Artwork, PoemArtwork, ProseArtwork, VisualArtArtwork, MusicArtwork, VideoArtwork, OtherArtwork } from '@/types';
import styled from "styled-components";
import { FaTimes, FaSoundcloud, FaShareAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

// ... Modal styles (copied from previous Modal.tsx) ...
const ModalBackdrop = styled.div.attrs({
  role: 'dialog',
  'aria-modal': true,
  'aria-label': 'Kunstwerk details',
})`
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

const Toast = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 2000;
  font-size: 1rem;
  opacity: 0.95;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
`;

// Type guards for union type fields
function hasMediaType(artwork: Artwork): artwork is (MusicArtwork | VisualArtArtwork | VideoArtwork | PoemArtwork) {
  return 'mediaType' in artwork && typeof (artwork as any).mediaType === 'string';
}
function hasMediaUrl(artwork: Artwork): artwork is (ProseArtwork | VisualArtArtwork | MusicArtwork | VideoArtwork | OtherArtwork) {
  return 'mediaUrl' in artwork && typeof (artwork as any).mediaUrl === 'string';
}
function hasCoverImageUrl(artwork: Artwork): artwork is ProseArtwork | VisualArtArtwork {
  return 'coverImageUrl' in artwork && typeof (artwork as any).coverImageUrl === 'string';
}
function hasSoundcloudEmbedUrl(artwork: Artwork): artwork is MusicArtwork {
  return 'soundcloudEmbedUrl' in artwork && typeof (artwork as any).soundcloudEmbedUrl === 'string';
}
function hasSoundcloudTrackUrl(artwork: Artwork): artwork is MusicArtwork {
  return 'soundcloudTrackUrl' in artwork && typeof (artwork as any).soundcloudTrackUrl === 'string';
}
function hasLyrics(artwork: Artwork): artwork is MusicArtwork {
  return 'lyrics' in artwork && typeof (artwork as any).lyrics === 'string';
}
function hasChords(artwork: Artwork): artwork is MusicArtwork {
  return 'chords' in artwork && typeof (artwork as any).chords === 'string';
}
function hasContent(artwork: Artwork): artwork is PoemArtwork {
  return 'content' in artwork && typeof (artwork as any).content === 'string';
}

export default function ArtworkModalPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined;
  const [artwork, setArtwork] = React.useState<Artwork | null>(null);
  const [showToast, setShowToast] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      notFound();
      return;
    }
    const fetchArtwork = async () => {
      const snapshot = await get(ref(db, `artworks/${id}`));
      if (!snapshot.exists()) {
        notFound();
        return;
      }
      setArtwork({ id, type: 'artwork', ...snapshot.val() });
    };
    fetchArtwork();
  }, [id]);

  if (!id || !artwork) return null;

  const dateObj = new Date(artwork.year, (artwork.month ?? 1) - 1, artwork.day ?? 1);
  const formattedDateStr = formatDate(dateObj);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleEdit = () => {
    // TODO: Implement edit logic, e.g. open AdminModal with this artwork
    alert('Edit functionality coming soon!');
  };
  const handleRemove = () => {
    // TODO: Implement remove logic, e.g. show confirmation and remove artwork
    alert('Remove functionality coming soon!');
  };

  return (
    <ModalBackdrop onClick={() => router.back()}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={() => router.back()} aria-label="Sluit modal">
          <FaTimes />
        </CloseButton>
        <h2>{artwork.title}</h2>
        <p style={{ marginTop: '0.25rem', opacity: 0.8 }}>({formattedDateStr})</p>
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{artwork.description}</p>
        <StyledHr />
        <MediaContainer>
          {artwork.category === 'prose' && (
            <>
              {hasCoverImageUrl(artwork) && (artwork as ProseArtwork).coverImageUrl && (
                <ModalImage
                  src={(artwork as ProseArtwork).coverImageUrl}
                  alt={`Cover voor ${(artwork as ProseArtwork).title}`}
                  style={{ marginBottom: '1rem' }}
                />
              )}
              {hasMediaUrl(artwork) && (artwork as ProseArtwork).mediaUrl && (
                <PdfViewer src={(artwork as ProseArtwork).mediaUrl} title={`PDF voor ${(artwork as ProseArtwork).title}`} />
              )}
            </>
          )}
          {hasMediaType(artwork) && artwork.mediaType === 'image' && hasMediaUrl(artwork) && (
            <ModalImage src={artwork.mediaUrl || '/logo192.png'} alt={artwork.title} loading="lazy" />
          )}
          {hasMediaType(artwork) && artwork.mediaType === 'audio' && (
            hasSoundcloudEmbedUrl(artwork) && artwork.soundcloudEmbedUrl ? (
              <SoundCloudEmbed
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={artwork.soundcloudEmbedUrl}
              ></SoundCloudEmbed>
            ) : (
              hasMediaUrl(artwork) && artwork.mediaUrl && (
                <audio controls src={artwork.mediaUrl} style={{ width: '100%' }}>
                  <track kind="captions" />
                  Your browser does not support the audio element.
                </audio>
              )
            )
          )}
          {hasMediaType(artwork) && artwork.mediaType === 'text' && hasContent(artwork) && (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <ReactMarkdown>{artwork.content || ''}</ReactMarkdown>
            </div>
          )}
        </MediaContainer>
        {hasSoundcloudTrackUrl(artwork) && artwork.soundcloudTrackUrl && (
          <SoundCloudLinkButton
            href={artwork.soundcloudTrackUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaSoundcloud size="1.5em" />
            <span>Luister op SoundCloud</span>
          </SoundCloudLinkButton>
        )}
        {hasLyrics(artwork) && artwork.lyrics && (
          <LyricsChordsSection>
            <h3>Songtekst / Extra Tekst</h3>
            <ReactMarkdown>{artwork.lyrics}</ReactMarkdown>
          </LyricsChordsSection>
        )}
        {hasChords(artwork) && typeof artwork.chords === 'string' && (
          <LyricsChordsSection>
            <h3>Akkoorden / Notities</h3>
            <p>{artwork.chords}</p>
          </LyricsChordsSection>
        )}
        <ModalFooter>
          <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaShareAlt /> Delen
          </button>
          <button onClick={handleEdit} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            ✏️ Bewerken
          </button>
          <button onClick={handleRemove} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'red' }}>
            🗑️ Verwijderen
          </button>
        </ModalFooter>
        {showToast && <Toast>Link gekopieerd!</Toast>}
      </ModalContent>
    </ModalBackdrop>
  );
}
