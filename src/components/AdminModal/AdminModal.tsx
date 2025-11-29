// src/components/AdminModal/AdminModal.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\AdminModal.tsx
"use client";

import React, { useRef, useEffect } from "react";
import styled, { useTheme } from 'styled-components';
import { MEDIUM_LABELS, SUBTYPE_LABELS } from '@/constants/medium';
// --- Modal Footer Styles ---
const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 2rem;
  gap: 2rem;
  font-size: 1rem;
`;
const FooterLeft = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-style: italic;
  color: ${({ theme }) => theme.textSecondary};
`;
const FooterRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;
const Pill = styled.span<{ $color: string }>`
  display: inline-block;
  padding: 0.25em 1em;
  border-radius: 999px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
  background: ${({ $color }) => $color};
  margin-bottom: 0.2em;
`;
import { AdminModalProps } from './types';
import { ArtworkFormData } from '@/types';
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
  const theme = useTheme();
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
  // Debug: log errors before rendering
  // eslint-disable-next-line no-console
  console.log('AdminModal: errors prop before render:', errors);

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
    // Debug: log when onSubmit is called
    // eslint-disable-next-line no-console
    console.log('AdminModal: onSubmit called (TEST)', e);
    // eslint-disable-next-line no-console
    console.log('AdminModal: formData at submit', formData);
    const success = await handleSubmit();
    // Debug: log result of handleSubmit
    // eslint-disable-next-line no-console
    console.log('AdminModal: handleSubmit result:', success);
    if (success) {
      handleClose();
    }
  };

  // Debug: log when AdminModal is rendered
  // eslint-disable-next-line no-console
  console.log('AdminModal: rendered, isOpen:', isOpen);
  // theme is now declared at the top
  // Helper: format date as "Month D, YYYY"
  function formatDate(year?: number, month?: number, day?: number) {
    if (!year || !month || !day) return '';
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  // Get pill color from theme.categories
  function getPillColor(medium?: string, subtype?: string) {
    if (!medium) return theme.categories?.other || '#888';
    // Prefer subcategory color if present
    if (subtype && theme.categories?.[subtype as keyof typeof theme.categories]) return theme.categories[subtype as keyof typeof theme.categories];
    return theme.categories[medium as keyof typeof theme.categories] || '#888';
  }
  // Get pill label
  function getMediumLabel(medium?: string) {
    return (medium && MEDIUM_LABELS[medium as keyof typeof MEDIUM_LABELS]) || medium || '';
  }
  function getSubtypeLabel(subtype?: string) {
    return (subtype && SUBTYPE_LABELS[subtype as keyof typeof SUBTYPE_LABELS]) || subtype || '';
  }

  return (
    <ModalBackdrop>
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
          <form
            onSubmit={onSubmit}
            role="form"
            ref={el => {
              // eslint-disable-next-line no-console
              console.log('AdminModal: form ref set', el);
            }}
          >
            <FormWrapper>
              {/* Debug: show errors and formData in DOM for validation */}
              <pre data-testid="errors-debug" style={{ color: 'red', fontSize: '10px' }}>{JSON.stringify({ errors, formData }, null, 2)}</pre>
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
              {/* Debug: print errors.general before rendering */}
              {/* Always render errors.debug for test reliability */}
              <pre data-testid="errors-debug-visible" style={{ color: 'red', fontSize: '12px' }}>{JSON.stringify(errors, null, 2)}</pre>
              {/* Render all error messages, or a general error if errors exist */}
              {(Object.keys(errors).length > 0 || errors.general) && (
                <ErrorMessage data-testid="error-message">
                  {Object.values(errors).filter(Boolean).join(' | ') || errors.general || 'Please fill in all required fields.'}
                </ErrorMessage>
              )}
              {message && (
                <SuccessMessage>{message}</SuccessMessage>
              )}
              <ButtonGroup>
                <Button
                  type="submit"
                  disabled={isLoading}
                  onClick={() => {
                    // eslint-disable-next-line no-console
                    console.log('AdminModal: submit button clicked');
                  }}
                >
                  {isLoading ? 'Bezig met opslaan...' : 'Opslaan'}
                </Button>
                <SecondaryButton type="button" onClick={handleClose}>
                  Annuleren
                </SecondaryButton>
              </ButtonGroup>
              {/* --- Modal Footer --- */}
              <ModalFooter>
                <FooterLeft>
                  <span style={{ fontStyle: 'italic', color: theme.textSecondary }}>
                    {[formData.location1, formatDate(formData.year, formData.month, formData.day)].filter(Boolean).join(', ')}
                  </span>
                </FooterLeft>
                <FooterRight>
                  {formData.medium && (
                    <Pill $color={getPillColor(formData.medium)}>{getMediumLabel(formData.medium)}</Pill>
                  )}
                  {formData.subtype && (
                    <Pill $color={getPillColor(formData.medium, formData.subtype)}>{getSubtypeLabel(formData.subtype)}</Pill>
                  )}
                </FooterRight>
              </ModalFooter>
            </FormWrapper>
          </form>
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
}

export default AdminModal;