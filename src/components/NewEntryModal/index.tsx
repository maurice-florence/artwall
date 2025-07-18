import React, { useState } from 'react';
import SimpleModal from '@/components/SimpleModal';
import { MEDIUMS } from '@/constants/medium';
import styled from 'styled-components';
import { FaTrash, FaShareAlt } from 'react-icons/fa';
import { storage } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { push, ref as dbRef } from 'firebase/database';
import { db } from '@/firebase';
import { ArtworkCategory } from '@/types';

const CategorySelect = styled.select`
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  font-size: 1rem;
`;

const FieldGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  min-height: 3.5em;
  max-height: 40vh;
  resize: vertical;
  box-sizing: border-box;
  overflow-y: auto;
`;

const SaveButton = styled.button`
  background: ${({ theme }) => theme.accent};
  color: ${({ theme }) => theme.accentText};
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
`;

const DeleteButton = styled.button`
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
  align-self: flex-end;
  transition: background 0.2s;
  &:hover {
    background: #c0392b;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  opacity: 0.9;
  background: transparent;
  padding: 0.5rem;
  border-radius: 4px;
  color: ${({ theme }) => theme.cardText};
`;

const mediumFields: Record<string, string[]> = {
  'drawing': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'writing': ['title', 'year', 'month', 'day', 'description', 'content'],
  'music': ['title', 'year', 'month', 'day', 'description', 'lyrics', 'audioFile', 'soundcloudUrl'],
  'sculpture': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'photography': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'video': ['title', 'year', 'month', 'day', 'description', 'mediaUrl'],
  'other': ['title', 'year', 'month', 'day', 'description', 'content', 'mediaUrl'],
};

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
  editItem?: any;
}

const initialState = {
  title: '',
  year: new Date().getFullYear(),
  month: 1,
  day: 1,
  medium: 'drawing',
  subtype: 'marker',
  description: '',
  content: '',
  lyrics: '',
  soundcloudUrl: '',
  youtubeUrl: '',
  coverImageUrl: '',
  pdfUrl: '',
  audioUrl: '',
  videoUrl: '',
  audioFile: null,
  videoFile: null,
};

const NewEntryModal: React.FC<NewEntryModalProps> = ({ isOpen, onClose, onSave, editItem }) => {
  const [form, setForm] = useState({ ...initialState });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (editItem) {
      setForm({ ...initialState, ...editItem });
    } else {
      setForm({ ...initialState });
    }
    setCoverFile(null);
    setPdfFile(null);
    setAudioFile(null);
    setVideoFile(null);
  }, [editItem, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // File input handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'pdf' | 'audio' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (type === 'cover') setCoverFile(file);
    if (type === 'pdf') setPdfFile(file);
    if (type === 'audio') setAudioFile(file);
    if (type === 'video') setVideoFile(file);
  };

  // Upload helper
  const uploadToStorage = async (file: File, path: string): Promise<string> => {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSave = async () => {
    setUploading(true);
    setError(null);
    try {
      let coverImageUrl = form.coverImageUrl || '';
      let pdfUrl = form.pdfUrl || '';
      let audioUrl = form.audioUrl || '';
      let videoUrl = form.videoUrl || '';
      // Upload cover image for specific mediums
      if (coverFile && ['writing', 'sculpture', 'drawing'].includes(form.medium)) {
        coverImageUrl = await uploadToStorage(coverFile, `covers/${Date.now()}_${coverFile.name}`);
      }
      // Upload PDF for writing subtype
      if (pdfFile && form.medium === 'writing' && form.subtype === 'prose') {
        pdfUrl = await uploadToStorage(pdfFile, `pdfs/${Date.now()}_${pdfFile.name}`);
      }
      // Upload audio for muziek
      if (audioFile && form.category === 'music') {
        audioUrl = await uploadToStorage(audioFile, `audio/${Date.now()}_${audioFile.name}`);
      }
      // Upload video for video
      if (videoFile && form.category === 'video') {
        videoUrl = await uploadToStorage(videoFile, `video/${Date.now()}_${videoFile.name}`);
      }
      // Compose artwork object
      const newArtwork: any = {
        ...form,
        coverImageUrl: coverImageUrl || undefined,
        pdfUrl: pdfUrl || undefined,
        audioUrl: audioUrl || undefined,
        videoUrl: videoUrl || undefined,
        type: 'artwork',
        year: Number(form.year),
        month: Number(form.month),
        day: Number(form.day),
      };
      // Remove empty fields
      Object.keys(newArtwork).forEach(key => {
        if (newArtwork[key] === '' || newArtwork[key] === undefined) {
          delete newArtwork[key];
        }
      });
      await onSave(newArtwork);
      setForm({ ...initialState });
      setCoverFile(null);
      setPdfFile(null);
      setAudioFile(null);
      setVideoFile(null);
      onClose();
    } catch (err) {
      let message = 'Onbekende fout.';
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  // Dynamic fields per category
  const fields = mediumFields[form.medium] || [];

  const renderField = (field: string) => {
    switch (field) {
      case 'title':
        return (
          <FieldGroup key="title">
            <Label>Titel</Label>
            <Input name="title" value={form.title} onChange={handleInputChange} required />
          </FieldGroup>
        );
      case 'year':
        return (
          <FieldGroup key="year">
            <Label>Jaar</Label>
            <Input name="year" type="number" value={form.year} onChange={handleInputChange} required />
          </FieldGroup>
        );
      case 'month':
        return (
          <FieldGroup key="month">
            <Label>Maand</Label>
            <Input name="month" type="number" value={form.month} onChange={handleInputChange} min={1} max={12} />
          </FieldGroup>
        );
      case 'day':
        return (
          <FieldGroup key="day">
            <Label>Dag</Label>
            <Input name="day" type="number" value={form.day} onChange={handleInputChange} min={1} max={31} />
          </FieldGroup>
        );
      case 'description':
        return (
          <FieldGroup key="description">
            <Label>Beschrijving</Label>
            <TextArea name="description" value={form.description} onChange={handleInputChange} />
          </FieldGroup>
        );
      case 'content':
        return (
          <FieldGroup key="content">
            <Label>Tekst</Label>
            <TextArea name="content" value={form.content} onChange={handleInputChange} />
          </FieldGroup>
        );
      case 'lyrics':
        return (
          <FieldGroup key="lyrics">
            <Label>Songtekst</Label>
            <TextArea name="lyrics" value={form.lyrics} onChange={handleInputChange} />
          </FieldGroup>
        );
      case 'audioFile':
        return (
          <FieldGroup key="audioFile">
            <Label>Audio uploaden</Label>
            <Input type="file" accept="audio/*" onChange={e => handleFileChange(e, 'audio')} />
            {audioFile && <span>{audioFile.name}</span>}
          </FieldGroup>
        );
      case 'soundcloudUrl':
        return (
          <FieldGroup key="soundcloudUrl">
            <Label>SoundCloud URL</Label>
            <Input name="soundcloudUrl" value={form.soundcloudUrl || ''} onChange={handleInputChange} />
          </FieldGroup>
        );
      case 'coverImageUrl':
        return (
          <FieldGroup key="coverImageUrl">
            <Label>Afbeelding uploaden</Label>
            <Input type="file" accept="image/*" onChange={e => handleFileChange(e, 'cover')} />
            {coverFile && <span>{coverFile.name}</span>}
          </FieldGroup>
        );
      case 'pdfUrl':
        return (
          <FieldGroup key="pdfUrl">
            <Label>PDF uploaden</Label>
            <Input type="file" accept="application/pdf" onChange={e => handleFileChange(e, 'pdf')} />
            {pdfFile && <span>{pdfFile.name}</span>}
          </FieldGroup>
        );
      case 'videoFile':
        return (
          <FieldGroup key="videoFile">
            <Label>Video uploaden</Label>
            <Input type="file" accept="video/*" onChange={e => handleFileChange(e, 'video')} />
            {videoFile && <span>{videoFile.name}</span>}
          </FieldGroup>
        );
      case 'youtubeUrl':
        return (
          <FieldGroup key="youtubeUrl">
            <Label>YouTube URL</Label>
            <Input name="youtubeUrl" value={form.youtubeUrl || ''} onChange={handleInputChange} />
          </FieldGroup>
        );
      default:
        return null;
    }
  };

  return (
    <SimpleModal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <CategorySelect name="medium" value={form.medium} onChange={handleInputChange}>
          {Object.keys(mediumFields).map(med => (
            <option key={med} value={med}>{med}</option>
          ))}
        </CategorySelect>
        {fields.map(renderField)}
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <SaveButton type="submit" disabled={uploading}>{uploading ? 'Opslaan...' : 'Opslaan'}</SaveButton>
      </form>
    </SimpleModal>
  );
};

export default NewEntryModal;
