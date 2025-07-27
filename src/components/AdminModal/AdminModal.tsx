// src/components/AdminModal/AdminModal.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\AdminModal.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { AdminModalProps } from './types';
import { useAdminModal } from './hooks/useAdminModal';
import { 
  BasicInfoForm, 
  CategorySpecificFields, 
  MediaUploadSection, 
  MetadataSection,
  DraftRecovery
} from './components'; // ✅ Import from index file
import { SmartFormIndicator } from './components/SmartFormIndicator';
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
    loadingState,
    updateField,
    handleSubmit,
    resetForm,
    isFieldLoading,
    hasDraft,
    loadDraft,
    clearDraft,
    // Smart form logic
    smartState,
    shouldShowField,
    isFieldRequired,
    shouldAnimateField,
    getContextualHelpText,
    getSmartSuggestions,
    getFieldPriority,
    getNextSuggestedField
  } = useAdminModal(artworkToEdit);

  const [showDraftRecovery, setShowDraftRecovery] = React.useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !artworkToEdit && hasDraft) {
      setShowDraftRecovery(true);
    }
    // Focus trap: focus first input when modal opens
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) {
        focusable[0].focus();
      }
    }
  }, [isOpen, artworkToEdit, hasDraft]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    setShowDraftRecovery(false);
    onClose();
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      // The draft is automatically loaded by the useAdminModal hook
      setShowDraftRecovery(false);
    }
  };

  const handleClearDraft = () => {
    clearDraft();
    setShowDraftRecovery(false);
  };

  const handleDismissDraft = () => {
    setShowDraftRecovery(false);
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
      <ModalContent
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adminmodal-title"
      >
        <CloseButton onClick={handleClose} aria-label="Sluiten">
          ×
        </CloseButton>
        <div data-testid="adminmodal">
          <h2 id="adminmodal-title" data-testid="form-title">{artworkToEdit ? 'Kunstwerk Bewerken' : 'Nieuw Kunstwerk'}</h2>
          <form onSubmit={onSubmit}>
            <FormWrapper>
              {showDraftRecovery && (
                <DraftRecovery
                  onLoadDraft={handleLoadDraft}
                  onClearDraft={handleClearDraft}
                  onDismiss={handleDismissDraft}
                />
              )}
              
              <SmartFormIndicator
                smartState={smartState}
                nextSuggestedField={getNextSuggestedField()}
                totalFields={smartState.visibleFields.length}
                completedFields={smartState.visibleFields.filter(field => {
                  const value = formData[field];
                  return value && (typeof value !== 'string' || value.trim() !== '');
                }).length}
              />
              
              <BasicInfoForm 
                formData={formData}
                errors={errors}
                updateField={updateField}
                isFieldLoading={isFieldLoading}
                shouldShowField={shouldShowField}
                isFieldRequired={isFieldRequired}
                shouldAnimateField={shouldAnimateField}
                getContextualHelpText={getContextualHelpText}
                getSmartSuggestions={getSmartSuggestions}
              />
              
              <CategorySpecificFields
                formData={formData}
                errors={errors}
                updateField={updateField}
                isFieldLoading={isFieldLoading}
                shouldShowField={shouldShowField}
                isFieldRequired={isFieldRequired}
                shouldAnimateField={shouldAnimateField}
                getContextualHelpText={getContextualHelpText}
                getSmartSuggestions={getSmartSuggestions}
              />
              
              <MediaUploadSection
                formData={formData}
                errors={errors}
                updateField={updateField}
                isFieldLoading={isFieldLoading}
                shouldShowField={shouldShowField}
                isFieldRequired={isFieldRequired}
                shouldAnimateField={shouldAnimateField}
                getContextualHelpText={getContextualHelpText}
                getSmartSuggestions={getSmartSuggestions}
              />
              
              <MetadataSection
                formData={formData}
                errors={errors}
                updateField={updateField}
                isFieldLoading={isFieldLoading}
                shouldShowField={shouldShowField}
                isFieldRequired={isFieldRequired}
                shouldAnimateField={shouldAnimateField}
                getContextualHelpText={getContextualHelpText}
                getSmartSuggestions={getSmartSuggestions}
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
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AdminModal;