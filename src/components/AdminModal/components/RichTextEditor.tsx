// src/components/AdminModal/components/RichTextEditor.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\RichTextEditor.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  maxLength?: number;
  minHeight?: number;
  showWordCount?: boolean;
}

const EditorContainer = styled.div`
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

const EditorWrapper = styled.div<{ hasError?: boolean; disabled?: boolean }>`
  border: 2px solid ${({ hasError }) => hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  ${({ disabled }) => disabled && `
    opacity: 0.6;
    background-color: #f9fafb;
  `}
  
  &:focus-within {
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent || '#E07A5F'}20;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.cardBg || '#f8f9fa'};
  border-bottom: 1px solid #e0e0e0;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ active?: boolean }>`
  padding: 6px 8px;
  border: 1px solid ${({ active, theme }) => active ? theme.accent || '#E07A5F' : 'transparent'};
  border-radius: 4px;
  background: ${({ active, theme }) => active ? theme.accent || '#E07A5F' : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.text};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ active, theme }) => active ? theme.accent || '#E07A5F' : '#f0f0f0'};
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditorTextarea = styled.textarea<{ minHeight?: number }>`
  width: 100%;
  min-height: ${({ minHeight }) => minHeight || 120}px;
  padding: 12px;
  border: none;
  outline: none;
  resize: vertical;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  
  &::placeholder {
    color: ${({ theme }) => theme.text};
    opacity: 0.5;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const EditorFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.cardBg || '#f8f9fa'};
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const WordCount = styled.span<{ overLimit?: boolean }>`
  color: ${({ overLimit }) => overLimit ? '#dc2626' : 'inherit'};
  font-weight: ${({ overLimit }) => overLimit ? '600' : 'normal'};
`;

const HelpText = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const ErrorMessage = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 12px;
`;

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Typ hier...',
  required = false,
  disabled = false,
  helpText,
  maxLength,
  minHeight = 120,
  showWordCount = true
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = value.length;
  const isOverLimit = maxLength ? charCount > maxLength : false;

  useEffect(() => {
    if (required && !value.trim()) {
      setError('Dit veld is verplicht');
    } else if (maxLength && charCount > maxLength) {
      setError(`Tekst is te lang (${charCount}/${maxLength} karakters)`);
    } else {
      setError(null);
    }
  }, [value, required, maxLength, charCount]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  }, [onChange]);

  const handleToolbarAction = useCallback((action: string) => {
    if (!textareaRef.current || disabled) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newValue = value;
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        if (selectedText) {
          newValue = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
          newCursorPos = start + 2;
        } else {
          newValue = value.substring(0, start) + '****' + value.substring(end);
          newCursorPos = start + 2;
        }
        break;
      
      case 'italic':
        if (selectedText) {
          newValue = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
          newCursorPos = start + 1;
        } else {
          newValue = value.substring(0, start) + '**' + value.substring(end);
          newCursorPos = start + 1;
        }
        break;
      
      case 'link':
        if (selectedText) {
          newValue = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
          newCursorPos = start + selectedText.length + 3;
        } else {
          newValue = value.substring(0, start) + '[tekst](url)' + value.substring(end);
          newCursorPos = start + 1;
        }
        break;
      
      case 'bullet':
        const lines = value.split('\n');
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        const currentLine = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);
        
        if (currentLine.trim().startsWith('- ')) {
          // Remove bullet
          newValue = value.substring(0, lineStart) + currentLine.replace(/^- /, '') + value.substring(lineEnd === -1 ? value.length : lineEnd);
          newCursorPos = start - 2;
        } else {
          // Add bullet
          newValue = value.substring(0, lineStart) + '- ' + currentLine + value.substring(lineEnd === -1 ? value.length : lineEnd);
          newCursorPos = start + 2;
        }
        break;
      
      case 'heading':
        const headingLines = value.split('\n');
        const headingLineStart = value.lastIndexOf('\n', start - 1) + 1;
        const headingLineEnd = value.indexOf('\n', start);
        const headingCurrentLine = value.substring(headingLineStart, headingLineEnd === -1 ? value.length : headingLineEnd);
        
        if (headingCurrentLine.trim().startsWith('### ')) {
          // Remove heading
          newValue = value.substring(0, headingLineStart) + headingCurrentLine.replace(/^### /, '') + value.substring(headingLineEnd === -1 ? value.length : headingLineEnd);
          newCursorPos = start - 4;
        } else {
          // Add heading
          newValue = value.substring(0, headingLineStart) + '### ' + headingCurrentLine + value.substring(headingLineEnd === -1 ? value.length : headingLineEnd);
          newCursorPos = start + 4;
        }
        break;
    }

    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, onChange, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          handleToolbarAction('bold');
          break;
        case 'i':
          e.preventDefault();
          handleToolbarAction('italic');
          break;
        case 'k':
          e.preventDefault();
          handleToolbarAction('link');
          break;
      }
    }
  }, [handleToolbarAction, disabled]);

  return (
    <EditorContainer>
      <Label required={required}>{label}</Label>
      
      <EditorWrapper hasError={!!error} disabled={disabled}>
        <Toolbar>
          <ToolbarButton
            type="button"
            onClick={() => handleToolbarAction('bold')}
            disabled={disabled}
            title="Vet (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarButton>
          
          <ToolbarButton
            type="button"
            onClick={() => handleToolbarAction('italic')}
            disabled={disabled}
            title="Cursief (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarButton>
          
          <ToolbarButton
            type="button"
            onClick={() => handleToolbarAction('link')}
            disabled={disabled}
            title="Link (Ctrl+K)"
          >
            🔗
          </ToolbarButton>
          
          <ToolbarButton
            type="button"
            onClick={() => handleToolbarAction('bullet')}
            disabled={disabled}
            title="Opsomming"
          >
            • 
          </ToolbarButton>
          
          <ToolbarButton
            type="button"
            onClick={() => handleToolbarAction('heading')}
            disabled={disabled}
            title="Kop"
          >
            H3
          </ToolbarButton>
        </Toolbar>
        
        <EditorTextarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          minHeight={minHeight}
        />
        
        {showWordCount && (
          <EditorFooter>
            <span>
              {wordCount} {wordCount === 1 ? 'woord' : 'woorden'}
            </span>
            {maxLength && (
              <WordCount overLimit={isOverLimit}>
                {charCount}/{maxLength} karakters
              </WordCount>
            )}
          </EditorFooter>
        )}
      </EditorWrapper>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helpText && <HelpText>{helpText}</HelpText>}
    </EditorContainer>
  );
};
