// src/components/AdminModal/AdminModal.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\AdminModal.tsx
"use client";

import React from "react";
import { AdminModalProps } from './types';
import { useAdminModal } from './hooks/useAdminModal';
import { BasicInfoForm } from './components/BasicInfoForm';
import { CategorySpecificFields } from './components/CategorySpecificFields';
import { MediaUploadSection } from './components/MediaUploadSection'; // ✅ This should work
import { MetadataSection } from './components/MetadataSection'; // ✅ This should work
import {
  ModalBackdrop,
  ModalContent,
  CloseButton,
  FormWrapper,
  ButtonGroup,
  Button,
  SecondaryButton,
  ErrorMessage,
  SuccessMessage
} from './styles';

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, artworkToEdit }) => {
  const {
    formData,
    errors,
    isLoading,
    message,
    updateField,
    handleSubmit,
    resetForm
  } = useAdminModal(artworkToEdit);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      handleClose();
    }
  };

  return (
    <ModalBackdrop onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} aria-label="Sluiten">
          ×
        </CloseButton>
        
        <h2>{artworkToEdit ? 'Kunstwerk Bewerken' : 'Nieuw Kunstwerk'}</h2>
        
        <form onSubmit={onSubmit}>
          <FormWrapper>
            <BasicInfoForm 
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
            
            <CategorySpecificFields
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
            
            <MediaUploadSection
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
            
            <MetadataSection
              formData={formData}
              errors={errors}
              updateField={updateField}
            />
            
            {errors.general && (
              <ErrorMessage>{errors.general}</ErrorMessage>
            )}
            
            {message && (
              <SuccessMessage>{message}</SuccessMessage>
            )}
            
            <ButtonGroup>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Bezig met opslaan...' : 'Opslaan'}
              </Button>
              <SecondaryButton type="button" onClick={handleClose}>
                Annuleren
              </SecondaryButton>
            </ButtonGroup>
          </FormWrapper>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AdminModal;