import React from 'react';
import styled from 'styled-components';
import { ArtworkFormData } from '@/types';

export interface SmartFormFieldProps {
  label: string;
  field: keyof ArtworkFormData;
  value: any;
  onChange: (field: keyof ArtworkFormData, value: any) => void;
  type?: 'text' | 'number' | 'url' | 'textarea' | 'select' | 'multiselect' | 'file' | 'richtext' | 'color' | 'date' | 'tags';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  formData?: ArtworkFormData;
  helpText?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  showProgress?: boolean;
  accept?: string;
  multiple?: boolean;
  previewUrl?: boolean;
  suggestions?: string[];
  animate?: boolean;
  inputProps?: Record<string, any>;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  loading?: boolean;
}

const FieldContainer = styled.div`
  margin-bottom: 16px;
`;

const StyledLabel = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
`;

export const SmartFormField: React.FC<SmartFormFieldProps> = ({
  label,
  field,
  value,
  onChange,
  type = 'text',
  required,
  disabled,
  placeholder,
  helpText,
  maxLength,
  min,
  max,
  accept,
  multiple,
  previewUrl,
  suggestions,
  animate,
  inputProps = {},
  options,
  rows = 4,
  loading,
}) => {
  const inputId = `smartformfield-${String(field)}`;
  let inputElement: React.ReactNode = null;

  switch (type) {
    case 'text':
    case 'url':
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type={type}
          value={value || ''}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          {...inputProps}
        />
      );
      break;
    case 'number':
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type="number"
          value={value ?? ''}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          {...inputProps}
        />
      );
      break;
    case 'textarea':
      inputElement = (
        <textarea
          id={inputId}
          name={String(field)}
          value={value || ''}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          {...inputProps}
        />
      );
      break;
    case 'select':
      inputElement = (
        <select
          id={inputId}
          name={String(field)}
          value={value || ''}
          onChange={e => onChange(field, e.target.value)}
          required={required}
          disabled={disabled}
          {...inputProps}
        >
          <option value="">Selecteer...</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
      break;
    case 'multiselect':
      inputElement = (
        <select
          id={inputId}
          name={String(field)}
          value={Array.isArray(value) ? value : []}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions, opt => opt.value);
            onChange(field, selected);
          }}
          multiple
          required={required}
          disabled={disabled}
          {...inputProps}
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
      break;
    case 'color':
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(field, e.target.value)}
          required={required}
          disabled={disabled}
          {...inputProps}
        />
      );
      break;
    case 'file':
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type="file"
          onChange={e => onChange(field, multiple ? Array.from(e.target.files || []) : e.target.files?.[0] || null)}
          required={required}
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          {...inputProps}
        />
      );
      break;
    case 'richtext':
      inputElement = (
        <textarea
          id={inputId}
          name={String(field)}
          value={value || ''}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          {...inputProps}
        />
      );
      break;
    case 'tags':
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type="text"
          value={Array.isArray(value) ? value.join(', ') : value || ''}
          onChange={e => onChange(field, e.target.value.split(',').map(v => v.trim()))}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...inputProps}
        />
      );
      break;
    case 'date':
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type="date"
          value={value || ''}
          onChange={e => onChange(field, e.target.value)}
          required={required}
          disabled={disabled}
          {...inputProps}
        />
      );
      break;
    default:
      inputElement = (
        <input
          id={inputId}
          name={String(field)}
          type="text"
          value={value || ''}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...inputProps}
        />
      );
  }

  return (
    <FieldContainer>
      <StyledLabel htmlFor={inputId}>
        {label}
        {required && <span style={{ color: '#dc2626' }}> *</span>}
      </StyledLabel>
      {inputElement}
      {helpText && <div style={{ fontSize: '0.9em', color: '#666', marginTop: '0.25em' }}>{helpText}</div>}
    </FieldContainer>
  );
};