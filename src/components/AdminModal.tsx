"use client";

import React, { Suspense } from "react";
import { CATEGORIES, CATEGORY_LABELS } from '@/constants';
import { Artwork } from '@/types';
import styled from 'styled-components';
import { ref as dbRef, get, update, push } from "firebase/database";
import Link from 'next/link';

// Modal backdrop and content
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  padding: 2rem 2.5rem 2.5rem 2.5rem;
  max-width: 600px;
  width: 100%;
  position: relative;
`;
const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #E07A5F;
  cursor: pointer;
`;

const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
`;

const SectionTitle = styled.h2`
  font-family: 'Lora', serif;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1.5rem;
`;

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworkToEdit?: Artwork | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, artworkToEdit }) => {
  const [title, setTitle] = React.useState("");
  const [year, setYear] = React.useState<number | null>(null);
  const [month, setMonth] = React.useState<number | null>(null);
  const [day, setDay] = React.useState<number | null>(null);
  const [category, setCategory] = React.useState<Artwork["category"]>("poetry");
  const [description, setDescription] = React.useState("");
  const [content, setContent] = React.useState("");
  const [lyrics, setLyrics] = React.useState("");
  const [chords, setChords] = React.useState("");
  const [soundcloudEmbedUrl, setSoundcloudEmbedUrl] = React.useState("");
  const [soundcloudTrackUrl, setSoundcloudTrackUrl] = React.useState("");
  const [isHidden, setIsHidden] = React.useState<boolean>(false);
  const [mediaType, setMediaType] = React.useState<string>("text");
  const [file, setFile] = React.useState<File | null>(null);
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");

  // Validation state
  const [validation, setValidation] = React.useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [filePreview, setFilePreview] = React.useState<string | null>(null);

  // Firebase imports
  // @ts-ignore
  const { db } = require("@/firebase");
  // @ts-ignore
  const { ref, push } = require("firebase/database");

  // Set initial date fields on client only to avoid hydration errors
  React.useEffect(() => {
    if (year === null || month === null || day === null) {
      const now = new Date();
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
      setDay(now.getDate());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect voor formulier vullen
  React.useEffect(() => {
    if (artworkToEdit) {
      // Only update if values are different
      if (
        title !== (artworkToEdit.title || "") ||
        year !== (artworkToEdit.year || new Date().getFullYear()) ||
        month !== (artworkToEdit.month || new Date().getMonth() + 1) ||
        day !== (artworkToEdit.day || new Date().getDate()) ||
        category !== (artworkToEdit.category || "poetry") ||
        description !== (artworkToEdit.description || "") ||
        content !== ("content" in artworkToEdit && artworkToEdit.content ? artworkToEdit.content : "") ||
        lyrics !== ("lyrics" in artworkToEdit && artworkToEdit.lyrics ? artworkToEdit.lyrics : "") ||
        chords !== ("chords" in artworkToEdit && artworkToEdit.chords ? artworkToEdit.chords : "") ||
        soundcloudEmbedUrl !== ("soundcloudEmbedUrl" in artworkToEdit && artworkToEdit.soundcloudEmbedUrl ? artworkToEdit.soundcloudEmbedUrl : "") ||
        soundcloudTrackUrl !== ("soundcloudTrackUrl" in artworkToEdit && artworkToEdit.soundcloudTrackUrl ? artworkToEdit.soundcloudTrackUrl : "") ||
        mediaType !== ("mediaType" in artworkToEdit && artworkToEdit.mediaType ? artworkToEdit.mediaType : "text") ||
        isHidden !== !!artworkToEdit.isHidden
      ) {
        setTitle(artworkToEdit.title || "");
        setYear(artworkToEdit.year || new Date().getFullYear());
        setMonth(artworkToEdit.month || new Date().getMonth() + 1);
        setDay(artworkToEdit.day || new Date().getDate());
        setCategory(artworkToEdit.category || "poetry");
        setDescription(artworkToEdit.description || "");
        if ('content' in artworkToEdit && artworkToEdit.content) setContent(artworkToEdit.content);
        else setContent("");
        if ('lyrics' in artworkToEdit && artworkToEdit.lyrics) setLyrics(artworkToEdit.lyrics);
        else setLyrics("");
        if ('chords' in artworkToEdit && artworkToEdit.chords) setChords(artworkToEdit.chords);
        else setChords("");
        if ('soundcloudEmbedUrl' in artworkToEdit && artworkToEdit.soundcloudEmbedUrl) setSoundcloudEmbedUrl(artworkToEdit.soundcloudEmbedUrl);
        else setSoundcloudEmbedUrl("");
        if ('soundcloudTrackUrl' in artworkToEdit && artworkToEdit.soundcloudTrackUrl) setSoundcloudTrackUrl(artworkToEdit.soundcloudTrackUrl);
        else setSoundcloudTrackUrl("");
        if ('mediaType' in artworkToEdit && artworkToEdit.mediaType) setMediaType(artworkToEdit.mediaType);
        else setMediaType("text");
        setIsHidden(!!artworkToEdit.isHidden);
      }
    } else {
      setTitle("");
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
      setDay(new Date().getDate());
      setCategory("poetry");
      setDescription("");
      setContent("");
      setLyrics("");
      setChords("");
      setSoundcloudEmbedUrl("");
      setSoundcloudTrackUrl("");
      setMediaType("text");
      setCoverFile(null);
      setFile(null);
      setCoverPreview(null);
      setFilePreview(null);
    }
  }, [artworkToEdit, isOpen]);

  // Preview for cover image
  React.useEffect(() => {
    if (coverFile) {
      const reader = new FileReader();
      reader.onload = e => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(coverFile);
    } else {
      setCoverPreview(null);
    }
  }, [coverFile]);

  // Preview for file (image/pdf/audio)
  React.useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  // Helper: which fields to show for each category
  const categoryFields: Record<string, string[]> = {
    poetry: ["title", "year", "month", "day", "description", "content"],
    prosepoëzie: ["title", "year", "month", "day", "description", "content"],
    prose: ["title", "year", "month", "day", "description", "content", "coverImageUrl"],
    music: ["title", "year", "month", "day", "description", "lyrics", "audioFile", "soundcloudUrl"],
    sculpture: ["title", "year", "month", "day", "description", "coverImageUrl"],
    drawing: ["title", "year", "month", "day", "description", "coverImageUrl"],
    image: ["title", "year", "month", "day", "description", "coverImageUrl"],
    video: ["title", "year", "month", "day", "description", "mediaUrl"],
    other: ["title", "year", "month", "day", "description", "content", "mediaUrl"],
  };
  const fieldsToShow = categoryFields[category] || [];

  // Validate fields on change
  // Defensive validation: never assume .length on undefined
  React.useEffect(() => {
    const v: Record<string, string> = {};
    if (!title) v.title = 'Titel is verplicht.';
    if (!year || year < 1900 || year > new Date().getFullYear() + 1) v.year = 'Voer een geldig jaar in.';
    if (month && (month < 1 || month > 12)) v.month = 'Maand moet tussen 1 en 12 zijn.';
    if (day && (day < 1 || day > 31)) v.day = 'Dag moet tussen 1 en 31 zijn.';
    if (fieldsToShow.includes('coverImageUrl') && !coverFile) v.coverImageUrl = 'Omslagafbeelding is verplicht.';
    // Defensive: check for any field that might be undefined/null before using .length
    if (fieldsToShow.includes('content')) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        v.content = 'Inhoud is verplicht.';
      }
    }
    setValidation(v);
  }, [title, year, month, day, coverFile, fieldsToShow, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const newArtwork: any = {
        title: typeof title === 'string' ? title : '',
        year: typeof year === 'number' ? year : new Date().getFullYear(),
        month: typeof month === 'number' ? month : new Date().getMonth() + 1,
        day: typeof day === 'number' ? day : new Date().getDate(),
        category: typeof category === 'string' ? category : 'poetry',
        description: typeof description === 'string' ? description : '',
        mediaType: typeof mediaType === 'string' ? mediaType : 'text',
        content: typeof content === 'string' ? content : '',
        lyrics: typeof lyrics === 'string' ? lyrics : '',
        chords: typeof chords === 'string' ? chords : '',
        soundcloudEmbedUrl: typeof soundcloudEmbedUrl === 'string' ? soundcloudEmbedUrl : '',
        soundcloudTrackUrl: typeof soundcloudTrackUrl === 'string' ? soundcloudTrackUrl : '',
        isHidden: !!isHidden,
        createdAt: (artworkToEdit && 'recordCreationDate' in artworkToEdit && artworkToEdit.recordCreationDate) ? artworkToEdit.recordCreationDate : Date.now(),
      };
      if (artworkToEdit && 'id' in artworkToEdit) {
        await update(dbRef(db, `artworks/${artworkToEdit.id}`), newArtwork);
        setSuccess("Kunstwerk succesvol bijgewerkt!");
      } else {
        await push(dbRef(db, "artworks"), newArtwork);
        setSuccess("Kunstwerk succesvol toegevoegd!");
      }
      onClose(); // Modal sluiten na succes
    } catch (err: any) {
      console.error("Opslaan error:", err, err?.stack); // <-- Add stack for debugging
      let errorMsg = "Fout bij opslaan: ";
      if (err && typeof err === 'object') {
        if (err.message) {
          errorMsg += err.message;
        } else if (typeof err.toString === 'function') {
          errorMsg += err.toString();
        } else {
          try {
            errorMsg += JSON.stringify(err);
          } catch (jsonErr) {
            errorMsg += '[onbekende fout, niet te serialiseren]';
          }
        }
      } else {
        errorMsg += String(err);
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix: calculate maxYear only on client to avoid hydration mismatch
  const maxYear = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return new Date().getFullYear() + 1;
    }
    return 2100; // fallback for SSR, will be replaced on client
  }, []);

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <ModalContent>
        <CloseButton onClick={onClose} title="Sluiten">×</CloseButton>
        <FormWrapper>
          <form onSubmit={handleSubmit}>
            {fieldsToShow.includes("title") && (
              <FieldGroup>
                <Label>Titel</Label>
                <input value={title} onChange={e => setTitle(e.target.value)} required />
                {validation.title && <span style={{ color: 'red' }}>{validation.title}</span>}
              </FieldGroup>
            )}
            {fieldsToShow.includes("year") && (
              <FieldGroup>
                <Label>Jaar</Label>
                <input type="number" value={year ?? ""} onChange={e => setYear(Number(e.target.value))} required min={1900} max={new Date().getFullYear() + 1} />
                {validation.year && <span style={{ color: 'red' }}>{validation.year}</span>}
              </FieldGroup>
            )}
            {fieldsToShow.includes("month") && (
              <FieldGroup>
                <Label>Maand</Label>
                <input type="number" min={1} max={12} value={month ?? ""} onChange={e => setMonth(Number(e.target.value))} />
                {validation.month && <span style={{ color: 'red' }}>{validation.month}</span>}
              </FieldGroup>
            )}
            {fieldsToShow.includes("day") && (
              <FieldGroup>
                <Label>Dag</Label>
                <input type="number" min={1} max={31} value={day ?? ""} onChange={e => setDay(Number(e.target.value))} />
                {validation.day && <span style={{ color: 'red' }}>{validation.day}</span>}
              </FieldGroup>
            )}
            {fieldsToShow.includes("description") && (
              <FieldGroup>
                <Label>Beschrijving</Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} />
              </FieldGroup>
            )}
            {fieldsToShow.includes("content") && (
              <FieldGroup>
                <Label>Content</Label>
                <textarea value={content} onChange={e => setContent(e.target.value)} />
              </FieldGroup>
            )}
            {fieldsToShow.includes("coverImageUrl") && (
              <FieldGroup>
                <Label>Omslagafbeelding</Label>
                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                {coverPreview && <img src={coverPreview} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 8 }} />}
              </FieldGroup>
            )}
            {fieldsToShow.includes("file") && (
              <FieldGroup>
                <Label>Bestand uploaden</Label>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                {filePreview && (
                  <div style={{ marginTop: 8 }}>
                    {file?.type.startsWith('image/') ? (
                      <img src={filePreview} alt="Preview" style={{ maxWidth: 200, borderRadius: 8 }} />
                    ) : file?.type === 'application/pdf' ? (
                      <embed src={filePreview} type="application/pdf" width="200" height="150" />
                    ) : file?.type.startsWith('audio/') ? (
                      <audio controls src={filePreview} style={{ width: 200 }} />
                    ) : (
                      <span>Voorbeeld niet beschikbaar</span>
                    )}
                  </div>
                )}
              </FieldGroup>
            )}
            {fieldsToShow.includes("mediaType") && (
              <FieldGroup>
                <Label>Media Type</Label>
                <select value={mediaType} onChange={e => setMediaType(e.target.value)}>
                  <option value="text">Tekst</option>
                  <option value="image">Afbeelding</option>
                  <option value="audio">Audio</option>
                  <option value="pdf">PDF</option>
                </select>
                <small>Kies het type media voor dit werk.</small>
              </FieldGroup>
            )}
            {fieldsToShow.includes("lyrics") && (
              <FieldGroup>
                <Label>Songtekst (lyrics)</Label>
                <textarea value={lyrics} onChange={e => setLyrics(e.target.value)} />
                <small>Songtekst voor muziekwerken.</small>
              </FieldGroup>
            )}
            {fieldsToShow.includes("chords") && (
              <FieldGroup>
                <Label>Akkoorden (chords)</Label>
                <textarea value={chords} onChange={e => setChords(e.target.value)} />
                <small>Akkoorden voor muziekwerken.</small>
              </FieldGroup>
            )}
            {fieldsToShow.includes("soundcloudEmbedUrl") && (
              <FieldGroup>
                <Label>SoundCloud Embed URL</Label>
                <input value={soundcloudEmbedUrl} onChange={e => setSoundcloudEmbedUrl(e.target.value)} />
                <small>Plak hier de embed-URL van SoundCloud.</small>
              </FieldGroup>
            )}
            {fieldsToShow.includes("soundcloudTrackUrl") && (
              <FieldGroup>
                <Label>SoundCloud Track URL</Label>
                <input value={soundcloudTrackUrl} onChange={e => setSoundcloudTrackUrl(e.target.value)} />
                <small>Plak hier de directe track-URL van SoundCloud.</small>
              </FieldGroup>
            )}
            <FieldGroup>
              <Label>
                Verborgen?
                <input type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} style={{ marginLeft: 8 }} />
              </Label>
            </FieldGroup>
            <button type="submit" disabled={isLoading || Object.keys(validation).length > 0} style={{ marginTop: 16, padding: '0.75rem 0', fontWeight: 700, background: '#E07A5F', color: '#fff', border: 'none', borderRadius: 6, fontSize: '1.1rem', cursor: 'pointer' }}>{isLoading ? "Bezig..." : "Opslaan"}</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
          </form>
        </FormWrapper>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AdminModal;

// If you get a build error like EPERM: operation not permitted, open '.next/trace',
// try closing all dev servers, deleting the .next folder, and running build again.
