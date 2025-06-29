"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS } from "@/constants";
import { Artwork } from "@/types";
import styled from 'styled-components';
import { ref as dbRef, get, update, push } from "firebase/database";
import Link from 'next/link';

const FormWrapper = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding: 2rem 2.5rem 2.5rem 2.5rem;
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
  color: ${({ theme }) => theme.text};
`;

const SectionTitle = styled.h2`
  font-family: 'Lora', serif;
  color: ${({ theme }) => theme.accent};
  margin-bottom: 1.5rem;
`;

// Extend Artwork type locally to include createdAt for editing
interface EditableArtwork extends Artwork {
  createdAt?: number;
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const [artworkToEdit, setArtworkToEdit] = React.useState<EditableArtwork | undefined>(undefined);

  // State voor alle velden
  const [title, setTitle] = React.useState<string>("");
  const [year, setYear] = React.useState<number | null>(null);
  const [month, setMonth] = React.useState<number | null>(null);
  const [day, setDay] = React.useState<number | null>(null);
  const [category, setCategory] = React.useState<Artwork["category"]>("poëzie");
  const [description, setDescription] = React.useState<string>("");
  const [mediaType, setMediaType] = React.useState<Artwork["mediaType"]>("text");
  const [content, setContent] = React.useState<string>("");
  const [lyrics, setLyrics] = React.useState<string>("");
  const [chords, setChords] = React.useState<string>("");
  const [soundcloudEmbedUrl, setSoundcloudEmbedUrl] = React.useState<string>("");
  const [soundcloudTrackUrl, setSoundcloudTrackUrl] = React.useState<string>("");
  const [isHidden, setIsHidden] = React.useState<boolean>(false);
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
  }, [year, month, day]);

  // Load artwork if editing
  React.useEffect(() => {
    if (editId) {
      get(dbRef(db, `artworks/${editId}`)).then(snapshot => {
        if (snapshot.exists()) {
          setArtworkToEdit({ id: editId, type: 'artwork', ...snapshot.val() });
        }
      });
    }
  }, [editId]);

  // Prefill form if editing (prevent infinite loop)
  React.useEffect(() => {
    if (artworkToEdit) {
      setYear(artworkToEdit.year || new Date().getFullYear());
      setMonth(artworkToEdit.month || new Date().getMonth() + 1);
      setDay(artworkToEdit.day || new Date().getDate());
      setCategory(artworkToEdit.category || "poëzie");
      setDescription(artworkToEdit.description || "");
      setMediaType(artworkToEdit.mediaType || "text");
      setContent(artworkToEdit.content || "");
      setLyrics(artworkToEdit.lyrics || "");
      setChords(artworkToEdit.chords || "");
      setSoundcloudEmbedUrl(artworkToEdit.soundcloudEmbedUrl || "");
      setSoundcloudTrackUrl(artworkToEdit.soundcloudTrackUrl || "");
      setIsHidden(!!artworkToEdit.isHidden);
    }
  }, [artworkToEdit]);

  // Track if component is mounted (for hydration-safe dynamic values)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // Helper: which fields to show for each category
  const categoryFields: Record<string, string[]> = {
    poëzie: ["title", "year", "month", "day", "description", "content"],
    prozapoëzie: ["title", "year", "month", "day", "description", "content"],
    proza: ["title", "year", "month", "day", "description", "content", "coverImageUrl"],
    sculptuur: ["title", "year", "month", "day", "description", "coverImageUrl"],
    tekening: ["title", "year", "month", "day", "description", "coverImageUrl"],
    muziek: [
      "title", "year", "month", "day", "description", "lyrics", "chords",
      "mediaType", "file", "soundcloudEmbedUrl", "soundcloudTrackUrl"
    ],
  };
  const fieldsToShow = categoryFields[category] || [];

  // Validate fields on change
  // Defensive validation: never assume .length on undefined
  React.useEffect(() => {
    const v: Record<string, string> = {};
    if (!title) v.title = 'Titel is verplicht.';
    if (!year || year < 1900 || year > (mounted ? new Date().getFullYear() + 1 : 2100)) v.year = 'Voer een geldig jaar in.';
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
  }, [title, year, month, day, coverFile, fieldsToShow, content, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const newArtwork = {
        title: typeof title === 'string' ? title : '',
        year: typeof year === 'number' ? year : new Date().getFullYear(),
        month: typeof month === 'number' ? month : new Date().getMonth() + 1,
        day: typeof day === 'number' ? day : new Date().getDate(),
        category: typeof category === 'string' ? category : 'poëzie',
        description: typeof description === 'string' ? description : '',
        mediaType: typeof mediaType === 'string' ? mediaType : 'text',
        content: typeof content === 'string' ? content : '',
        lyrics: typeof lyrics === 'string' ? lyrics : '',
        chords: typeof chords === 'string' ? chords : '',
        soundcloudEmbedUrl: typeof soundcloudEmbedUrl === 'string' ? soundcloudEmbedUrl : '',
        soundcloudTrackUrl: typeof soundcloudTrackUrl === 'string' ? soundcloudTrackUrl : '',
        isHidden: !!isHidden,
        createdAt: (artworkToEdit && 'createdAt' in artworkToEdit && artworkToEdit.createdAt) ? artworkToEdit.createdAt : Date.now(),
      };
      if (editId && artworkToEdit) {
        await update(dbRef(db, `artworks/${editId}`), newArtwork);
        setSuccess("Kunstwerk succesvol bijgewerkt!");
      } else {
        await push(dbRef(db, "artworks"), newArtwork);
        setSuccess("Kunstwerk succesvol toegevoegd!");
      }
      // Optionally redirect or reset form
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

  // Fix: calculate maxYear only on client to avoid hydration mismatch
  const maxYear = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return new Date().getFullYear() + 1;
    }
    return 2100; // fallback for SSR, will be replaced on client
  }, []);

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/" style={{ color: '#2E86C1', textDecoration: 'underline', fontWeight: 600 }}>
          &larr; Terug naar Home
        </Link>
      </div>
      <FormWrapper>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FieldGroup>
            <Label>Categorie</Label>
            <select value={category} onChange={e => setCategory(e.target.value as Artwork["category"])}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
            <small>Kies de categorie van het kunstwerk.</small>
          </FieldGroup>
          {fieldsToShow.includes("title") && (
            <FieldGroup>
              <Label>Titel</Label>
              <input value={title} onChange={e => setTitle(e.target.value)} required />
              <small>Geef een duidelijke titel op.</small>
              {validation.title && <span style={{ color: 'red' }}>{validation.title}</span>}
            </FieldGroup>
          )}
          {fieldsToShow.includes("year") && (
            <FieldGroup>
              <Label>Jaar</Label>
              <input type="number" value={year ?? ""} onChange={e => setYear(Number(e.target.value))} required min={1900} max={mounted ? new Date().getFullYear() + 1 : 2100} />
              <small>Bijvoorbeeld: 2025</small>
              {validation.year && <span style={{ color: 'red' }}>{validation.year}</span>}
            </FieldGroup>
          )}
          {fieldsToShow.includes("month") && (
            <FieldGroup>
              <Label>Maand</Label>
              <input type="number" min={1} max={12} value={month ?? ""} onChange={e => setMonth(Number(e.target.value))} />
              <small>1 = januari, 12 = december</small>
              {validation.month && <span style={{ color: 'red' }}>{validation.month}</span>}
            </FieldGroup>
          )}
          {fieldsToShow.includes("day") && (
            <FieldGroup>
              <Label>Dag</Label>
              <input type="number" min={1} max={31} value={day ?? ""} onChange={e => setDay(Number(e.target.value))} />
              <small>Optioneel. 1 t/m 31.</small>
              {validation.day && <span style={{ color: 'red' }}>{validation.day}</span>}
            </FieldGroup>
          )}
          {fieldsToShow.includes("description") && (
            <FieldGroup>
              <Label>Beschrijving</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} />
              <small>Korte omschrijving van het werk.</small>
            </FieldGroup>
          )}
          {fieldsToShow.includes("content") && (
            <FieldGroup>
              <Label>Content</Label>
              <textarea value={content} onChange={e => setContent(e.target.value)} />
              <small>De volledige tekst of inhoud.</small>
            </FieldGroup>
          )}
          {fieldsToShow.includes("coverImageUrl") && (
            <FieldGroup>
              <Label>Omslagafbeelding</Label>
              <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
              <small>Upload een afbeelding (jpg, png, etc.).</small>
              {coverPreview && <img src={coverPreview} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 8 }} />}
              {validation.coverImageUrl && <span style={{ color: 'red' }}>{validation.coverImageUrl}</span>}
            </FieldGroup>
          )}
          {fieldsToShow.includes("file") && (
            <FieldGroup>
              <Label>Bestand uploaden</Label>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
              <small>Upload een bestand (afbeelding, audio, pdf, etc.).</small>
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
              <select value={mediaType} onChange={e => setMediaType(e.target.value as Artwork["mediaType"])}>
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
    </>
  );
}

function AdminPage() {
  return null;
}

export default AdminPage;

// If you get a build error like EPERM: operation not permitted, open '.next/trace',
// try closing all dev servers, deleting the .next folder, and running build again.
