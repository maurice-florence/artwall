const StyledLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: inherit;
`;
// src/components/AdminModal/components/FileUpload.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\FileUpload.tsx
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFileSelect: (files: File[]) => void;
  disabled?: boolean;
  preview?: boolean;
  value?: File | File[] | null;
  helpText?: string;
}

const DropZone = styled.div<{ isDragging: boolean; hasError: boolean }>`
  border: 2px dashed ${({ isDragging, hasError, theme }) => 
    hasError ? '#dc2626' : 
    isDragging ? (theme.accent || '#E07A5F') : '#d1d5db'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: ${({ isDragging, theme }) => 
    isDragging ? (theme.accent || '#E07A5F') + '10' : 
    theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    background-color: ${({ theme }) => theme.accent || '#E07A5F'}10;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.accent || '#E07A5F'};
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
`;

const UploadSubtext = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const FilePreview = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const FileIcon = styled.div`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.accent || '#E07A5F'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
`;

const FileDetails = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 4px;
  
  &:hover {
    background-color: #dc262620;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.875rem;
`;

const HelpText = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '*',
  multiple = false,
  maxSize = 10,
  onFileSelect,
  disabled = false,
  preview = true,
  value,
  helpText
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Bestand is te groot. Maximum: ${maxSize}MB`);
      return false;
    }

    // Check file type if accept is specified
    if (accept !== '*' && accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileName = file.name;
      
      const isValidType = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileName.toLowerCase().endsWith(acceptedType.toLowerCase());
        }
        return fileType.match(acceptedType.replace('*', '.*'));
      });
      
      if (!isValidType) {
        setError(`Ongeldig bestandstype. Toegestaan: ${accept}`);
        return false;
      }
    }

    setError(null);
    return true;
  }, [accept, maxSize]);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  }, [validateFile, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemoveFile = useCallback((index: number) => {
    if (Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index);
      onFileSelect(newFiles);
    } else {
      onFileSelect([]);
    }
  }, [value, onFileSelect]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const currentFiles = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div>
      <StyledLabel>{label}</StyledLabel>
      
      <DropZone
        isDragging={isDragging}
        hasError={!!error}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon>📎</UploadIcon>
        <UploadText>
          {isDragging ? 'Laat bestanden los...' : 'Klik om bestanden te selecteren of sleep ze hierheen'}
        </UploadText>
        <UploadSubtext>
          {accept !== '*' && `Toegestaan: ${accept}`}
          {maxSize && ` • Max: ${maxSize}MB`}
          {multiple && ' • Meerdere bestanden toegestaan'}
        </UploadSubtext>
      </DropZone>

      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {preview && currentFiles.length > 0 && (
        <FilePreview>
          {currentFiles.map((file, index) => (
            <FileItem key={index}>
              <FileInfo>
                <FileIcon>{getFileExtension(file.name)}</FileIcon>
                <FileDetails>
                  <FileName>{file.name}</FileName>
                  <FileSize>{formatFileSize(file.size)}</FileSize>
                </FileDetails>
              </FileInfo>
              <RemoveButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
              >
                ×
              </RemoveButton>
            </FileItem>
          ))}
        </FilePreview>
      )}

      {helpText && <HelpText>{helpText}</HelpText>}
    </div>
  );
};
