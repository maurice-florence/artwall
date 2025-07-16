// src/components/AdminModal/components/MultiSelectField.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\MultiSelectField.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  maxSelections?: number;
  searchable?: boolean;
  showSelectAll?: boolean;
  hasError?: boolean;
  hasWarning?: boolean;
}

const FieldContainer = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label<{ required?: boolean }>`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  
  ${({ required }) => required && `
    &::after {
      content: ' *';
      color: #dc2626;
    }
  `}
`;

const MultiSelectContainer = styled.div`
  position: relative;
`;

const SelectButton = styled.button<{ hasError?: boolean; hasWarning?: boolean; disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${({ hasError, hasWarning }) => 
    hasError ? '#dc2626' : hasWarning ? '#d97706' : '#d1d5db'};
  border-radius: 8px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent || '#E07A5F'}20;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    color: #9ca3af;
  }
`;

const SelectButtonText = styled.span`
  flex: 1;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const SelectButtonIcon = styled.span<{ isOpen: boolean }>`
  transform: rotate(${({ isOpen }) => isOpen ? '180deg' : '0deg'});
  transition: transform 0.2s;
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.cardBg || '#ffffff'};
  border: 2px solid ${({ theme }) => theme.accent || '#E07A5F'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${({ isOpen }) => isOpen ? 'block' : 'none'};
  margin-top: 4px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.accent || '#E07A5F'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const OptionsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const Option = styled.div<{ selected: boolean; disabled?: boolean }>`
  padding: 12px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  background-color: ${({ selected, theme }) => 
    selected ? (theme.accent || '#E07A5F') + '20' : 'transparent'};
  color: ${({ disabled, theme }) => 
    disabled ? '#9ca3af' : (theme.text || '#333')};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ disabled, theme }) => 
      disabled ? 'transparent' : (theme.accent || '#E07A5F') + '10'};
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.accent || '#E07A5F'};
`;

const SelectedTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.accent || '#E07A5F'};
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TagRemoveButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
  
  &:hover {
    opacity: 0.7;
  }
`;

const HelpText = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const SelectAllOption = styled.div`
  padding: 12px;
  cursor: pointer;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
  color: ${({ theme }) => theme.accent || '#E07A5F'};
  
  &:hover {
    background-color: #f1f3f4;
  }
`;

const NoOptions = styled.div`
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
`;

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select options...',
  required = false,
  disabled = false,
  helpText,
  maxSelections,
  searchable = true,
  showSelectAll = true,
  hasError = false,
  hasWarning = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = useCallback((optionValue: string) => {
    if (disabled) return;
    
    const isSelected = value.includes(optionValue);
    
    if (isSelected) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onChange([...value, optionValue]);
    }
  }, [value, onChange, disabled, maxSelections]);

  const handleSelectAll = useCallback(() => {
    if (disabled) return;
    
    const allValues = filteredOptions
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    if (maxSelections) {
      onChange(allValues.slice(0, maxSelections));
    } else {
      onChange(allValues);
    }
  }, [filteredOptions, onChange, disabled, maxSelections]);

  const handleDeselectAll = useCallback(() => {
    if (disabled) return;
    onChange([]);
  }, [onChange, disabled]);

  const handleRemoveTag = useCallback((tagValue: string) => {
    if (disabled) return;
    onChange(value.filter(v => v !== tagValue));
  }, [value, onChange, disabled]);

  const getSelectedLabels = () => {
    return value
      .map(v => options.find(option => option.value === v)?.label)
      .filter(Boolean);
  };

  const getDisplayText = () => {
    const selectedLabels = getSelectedLabels();
    
    if (selectedLabels.length === 0) {
      return placeholder;
    }
    
    if (selectedLabels.length === 1) {
      return selectedLabels[0];
    }
    
    return `${selectedLabels.length} selected`;
  };

  const allSelected = filteredOptions.every(option => 
    option.disabled || value.includes(option.value)
  );

  return (
    <FieldContainer>
      <Label required={required}>{label}</Label>
      
      <MultiSelectContainer ref={containerRef}>
        <SelectButton
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          hasError={hasError}
          hasWarning={hasWarning}
          disabled={disabled}
        >
          <SelectButtonText>{getDisplayText()}</SelectButtonText>
          <SelectButtonIcon isOpen={isOpen}>▼</SelectButtonIcon>
        </SelectButton>
        
        <Dropdown isOpen={isOpen}>
          {searchable && (
            <SearchInput
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          {showSelectAll && filteredOptions.length > 0 && (
            <SelectAllOption
              onClick={allSelected ? handleDeselectAll : handleSelectAll}
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </SelectAllOption>
          )}
          
          <OptionsList>
            {filteredOptions.length === 0 ? (
              <NoOptions>
                {searchTerm ? 'No options found' : 'No options available'}
              </NoOptions>
            ) : (
              filteredOptions.map(option => (
                <Option
                  key={option.value}
                  selected={value.includes(option.value)}
                  disabled={option.disabled}
                  onClick={() => !option.disabled && handleToggleOption(option.value)}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    disabled={option.disabled}
                    onChange={() => {}} // Handled by parent click
                  />
                  <span>{option.label}</span>
                </Option>
              ))
            )}
          </OptionsList>
        </Dropdown>
      </MultiSelectContainer>
      
      {value.length > 0 && (
        <SelectedTags>
          {getSelectedLabels().map((label, index) => (
            <Tag key={value[index]}>
              {label}
              <TagRemoveButton
                onClick={() => handleRemoveTag(value[index])}
                disabled={disabled}
              >
                ×
              </TagRemoveButton>
            </Tag>
          ))}
        </SelectedTags>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </FieldContainer>
  );
};
