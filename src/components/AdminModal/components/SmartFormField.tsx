// src/components/AdminModal/components/SmartFormField.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\SmartFormField.tsx
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { validateField } from '../utils/validation';
import { ValidationMessage } from './ValidationMessage';
import { ArtworkFormData } from '@/types';

interface SmartFormFieldProps {
  label: string;
  field: keyof ArtworkFormData;
  value: any;
  formData: ArtworkFormData;
  onChange: (field: keyof ArtworkFormData, value: any) => void;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'url';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  disabled?: boolean;
  helpText?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  loading?: boolean;
  showProgress?: boolean;
}

const FieldContainer = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  
  ${({ required }) => required && `
    &::after {
      content: ' *';
      color: #dc2626;
    }
  `}
`;

const Input = styled.input<{ hasError?: boolean; hasWarning?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ hasError, hasWarning }) => 
    hasError ? '#dc2626' : hasWarning ? '#d97706' : '#d1d5db'};
  border-radius: 8px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent}20;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean; hasWarning?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ hasError, hasWarning }) => 
    hasError ? '#dc2626' : hasWarning ? '#d97706' : '#d1d5db'};
  border-radius: 8px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent}20;
  }
`;

const Select = styled.select<{ hasError?: boolean; hasWarning?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ hasError, hasWarning }) => 
    hasError ? '#dc2626' : hasWarning ? '#d97706' : '#d1d5db'};
  border-radius: 8px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent}20;
  }
`;

const HelpText = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const CharacterCount = styled.div<{ isNearLimit?: boolean }>`
  text-align: right;
  font-size: 12px;
  color: ${({ isNearLimit }) => isNearLimit ? '#d97706' : '#6b7280'};
  margin-top: 4px;
`;

const LoadingIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${({ theme }) => theme.accent}20;
  border-top: 2px solid ${({ theme }) => theme.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${({ theme }) => theme.accent}20;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background-color: ${({ theme }) => theme.accent};
  width: ${({ progress }) => progress}%;
  transition: width 0.3s ease;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'}90;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  backdrop-filter: blur(1px);
`;

export const SmartFormField: React.FC<SmartFormFieldProps> = ({
  label,
  field,
  value,
  formData,
  onChange,
  type = 'text',
  placeholder,
  required,
  options,
  rows,
  disabled,
  helpText,
  maxLength,
  min,
  max,
  loading = false,
  showProgress = false
}) => {
  const [validation, setValidation] = useState<{ error?: string; warning?: string }>({});
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = useCallback((newValue: any) => {
    onChange(field, newValue);
    
    // Real-time validation
    const validationResult = validateField(field as string, newValue, formData);
    setValidation(validationResult);
  }, [field, formData, onChange]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    const validationResult = validateField(field as string, value, formData);
    setValidation(validationResult);
  }, [field, value, formData]);

  const renderInput = () => {
    const commonProps = {
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleChange(type === 'number' ? Number(e.target.value) : e.target.value),
      onBlur: handleBlur,
      placeholder,
      disabled,
      hasError: !!(isTouched && validation.error),
      hasWarning: !!(isTouched && validation.warning && !validation.error)
    };

    switch (type) {
      case 'textarea':
        return (
          <TextArea
            {...commonProps}
            rows={rows || 4}
            maxLength={maxLength}
          />
        );
      
      case 'select':
        return (
          <Select {...commonProps}>
            <option value="">Selecteer...</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={min}
            max={max}
          />
        );
      
      case 'url':
        return (
          <Input
            {...commonProps}
            type="url"
            maxLength={maxLength}
          />
        );
      
      default:
        return (
          <Input
            {...commonProps}
            type="text"
            maxLength={maxLength}
          />
        );
    }
  };

  const showCharacterCount = maxLength && (type === 'text' || type === 'textarea' || type === 'url');
  const characterCount = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength ? characterCount > maxLength * 0.8 : false;
  const progress = maxLength ? Math.min((characterCount / maxLength) * 100, 100) : 0;

  return (
    <FieldContainer>
      <Label required={required}>
        {label}
        {loading && (
          <LoadingIndicator>
            <Spinner />
            <span>Verwerken...</span>
          </LoadingIndicator>
        )}
      </Label>
      
      <InputContainer>
        {renderInput()}
        {loading && (
          <LoadingOverlay>
            <Spinner />
          </LoadingOverlay>
        )}
      </InputContainer>
      
      {showProgress && maxLength && (
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
      )}
      
      {showCharacterCount && (
        <CharacterCount isNearLimit={isNearLimit}>
          {characterCount}/{maxLength}
        </CharacterCount>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
      
      {isTouched && validation.error && (
        <ValidationMessage type="error" message={validation.error} field={field as string} />
      )}
      
      {isTouched && validation.warning && !validation.error && (
        <ValidationMessage type="warning" message={validation.warning} field={field as string} />
      )}
    </FieldContainer>
  );
};

export default SmartFormField;