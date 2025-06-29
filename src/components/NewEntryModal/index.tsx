import React, { useState } from 'react';
import SimpleModal from '@/components/SimpleModal';
import { CATEGORIES } from '@/constants';
import styled from 'styled-components';
import { FaTrash, FaShareAlt } from 'react-icons/fa';

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

const categoryFields: Record<string, string[]> = {
  'poëzie': ['title', 'year', 'month', 'day', 'description', 'content'],
  'prozapoëzie': ['title', 'year', 'month', 'day', 'description', 'content'],
  'proza': ['title', 'year', 'month', 'day', 'description', 'content', 'coverImageUrl'],
  'sculptuur': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'tekening': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'muziek': [
    'title', 'year', 'month', 'day', 'description', 'lyrics', 'chords',
    'mediaType', 'file', 'soundcloudEmbedUrl', 'soundcloudTrackUrl'
  ],
  'beeld': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'video': ['title', 'year', 'month', 'day', 'description', 'coverImageUrl'],
  'overig': ['title', 'year', 'month', 'day', 'description', 'content'],
};

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: any) => void;
  editItem?: any;
}

const NewEntryModal: React.FC<NewEntryModalProps> = ({ isOpen, onClose, onSave, editItem }) => {
  const [category, setCategory] = useState<string>('');
  const [fields, setFields] = useState<Record<string, any>>({});

  // Helper for auto-growing textarea
  const handleAutoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, window.innerHeight * 0.4) + 'px';
  };

  React.useEffect(() => {
    if (editItem) {
      setCategory(editItem.category || '');
      setFields(editItem);
    } else {
      setCategory('');
      setFields({});
    }
  }, [editItem]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setFields({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!category) return;
    onSave({ ...fields, category });
    setCategory('');
    setFields({});
    onClose();
  };

  return (
    <SimpleModal isOpen={isOpen} onClose={onClose}>
      <h2>Nieuwe kaart toevoegen</h2>
      <CategorySelect value={category} onChange={handleCategoryChange}>
        <option value="">Kies een categorie...</option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </CategorySelect>
      {category && (
        <>
          {categoryFields[category]?.map((field) => (
            <FieldGroup key={field}>
              <Label>{field}
                {field === 'content' && (
                  <span style={{ fontWeight: 'normal', color: '#888', fontSize: '0.85em', marginLeft: 8 }}>
                    (Gebruik lege regels voor strofen, *cursief*, **vet**, [link](https://...))
                  </span>
                )}
              </Label>
              {field === 'description' || field === 'content' || field === 'lyrics' || field === 'chords' ? (
                <TextArea
                  value={fields[field] || ''}
                  onChange={e => { handleFieldChange(field, e.target.value); handleAutoGrow(e as any); }}
                  style={{ minHeight: '3.5em', maxHeight: '40vh', resize: 'vertical', overflowY: 'auto' }}
                />
              ) : (
                <Input value={fields[field] || ''} onChange={e => handleFieldChange(field, e.target.value)} />
              )}
            </FieldGroup>
          ))}
          <CardFooter>
            <SaveButton onClick={handleSave}>Opslaan</SaveButton>
            {editItem && (
              <DeleteButton onClick={() => { if (window.confirm('Weet je zeker dat je deze kaart wilt verwijderen?')) { onSave({ ...fields, _delete: true }); onClose(); } }}>
                <FaTrash style={{ marginRight: 6 }} /> Verwijder
              </DeleteButton>
            )}
          </CardFooter>
        </>
      )}
    </SimpleModal>
  );
};

export default NewEntryModal;
