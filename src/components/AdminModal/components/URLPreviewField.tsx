// src/components/AdminModal/components/URLPreviewField.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\URLPreviewField.tsx
import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

interface URLPreviewFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  showPreview?: boolean;
  previewTypes?: ('image' | 'video' | 'audio' | 'embed')[];
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

const InputContainer = styled.div`
  position: relative;
`;

const URLInput = styled.input<{ hasError?: boolean; hasWarning?: boolean }>`
  width: 100%;
  padding: 12px;
  padding-right: 40px;
  border: 2px solid ${({ hasError, hasWarning }) => 
    hasError ? '#dc2626' : hasWarning ? '#d97706' : '#d1d5db'};
  border-radius: 8px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent || '#E07A5F'}20;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const URLIcon = styled.div<{ isValid: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ isValid }) => isValid ? '#10b981' : '#9ca3af'};
  font-size: 18px;
`;

const PreviewContainer = styled.div`
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
`;

const PreviewHeader = styled.div`
  padding: 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const PreviewContent = styled.div`
  padding: 12px;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
`;

const PreviewVideo = styled.video`
  width: 100%;
  max-height: 200px;
  border-radius: 4px;
`;

const PreviewAudio = styled.audio`
  width: 100%;
`;

const PreviewEmbed = styled.iframe`
  width: 100%;
  height: 200px;
  border: none;
  border-radius: 4px;
`;

const PreviewError = styled.div`
  color: #dc2626;
  font-size: 14px;
  padding: 12px;
  background-color: #fef2f2;
  border-radius: 4px;
`;

const PreviewLoading = styled.div`
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
`;

const URLInfo = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  display: flex;
  gap: 16px;
`;

const URLInfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HelpText = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #f3f4f6;
  border-top: 2px solid ${({ theme }) => theme.accent || '#E07A5F'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface URLPreviewData {
  type: 'image' | 'video' | 'audio' | 'embed' | 'unknown';
  title?: string;
  description?: string;
  thumbnail?: string;
  fileSize?: number;
  duration?: number;
  isValid: boolean;
  error?: string;
}

export const URLPreviewField: React.FC<URLPreviewFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://example.com/resource',
  required = false,
  disabled = false,
  helpText,
  showPreview = true,
  previewTypes = ['image', 'video', 'audio', 'embed'],
  hasError = false,
  hasWarning = false
}) => {
  const [previewData, setPreviewData] = useState<URLPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidURL, setIsValidURL] = useState(false);

  const isValidHttpURL = useCallback((string: string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }, []);

  const getURLType = useCallback((url: string): URLPreviewData['type'] => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    
    if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(extension || '')) {
      return 'video';
    }
    
    if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(extension || '')) {
      return 'audio';
    }
    
    // Check for embed URLs
    if (url.includes('youtube.com') || url.includes('youtu.be') || 
        url.includes('vimeo.com') || url.includes('soundcloud.com')) {
      return 'embed';
    }
    
    return 'unknown';
  }, []);

  const loadPreview = useCallback(async (url: string) => {
    if (!isValidHttpURL(url) || !showPreview) return;
    
    setIsLoading(true);
    
    try {
      const type = getURLType(url);
      
      if (type !== 'unknown' && !previewTypes.includes(type)) {
        setPreviewData(null);
        setIsLoading(false);
        return;
      }
      
      // For images, check if the URL is accessible
      if (type === 'image') {
        const img = new Image();
        img.onload = () => {
          setPreviewData({
            type,
            isValid: true,
            title: url.split('/').pop() || 'Image'
          });
          setIsLoading(false);
        };
        img.onerror = () => {
          setPreviewData({
            type,
            isValid: false,
            error: 'Failed to load image'
          });
          setIsLoading(false);
        };
        img.src = url;
      } else {
        // For other types, just set the type
        setPreviewData({
          type,
          isValid: true,
          title: url.split('/').pop() || 'Resource'
        });
        setIsLoading(false);
      }
    } catch (error) {
      setPreviewData({
        type: 'unknown',
        isValid: false,
        error: 'Invalid URL'
      });
      setIsLoading(false);
    }
  }, [isValidHttpURL, showPreview, getURLType, previewTypes]);

  useEffect(() => {
    const valid = isValidHttpURL(value);
    setIsValidURL(valid);
    
    if (valid) {
      const timeoutId = setTimeout(() => {
        loadPreview(value);
      }, 500); // Debounce preview loading
      
      return () => clearTimeout(timeoutId);
    } else {
      setPreviewData(null);
    }
  }, [value, isValidHttpURL, loadPreview]);

  const renderPreview = () => {
    if (!showPreview || !previewData || !isValidURL) return null;

    return (
      <PreviewContainer>
        <PreviewHeader>
          URL Preview
          {isLoading && <LoadingSpinner />}
        </PreviewHeader>
        <PreviewContent>
          {previewData.error ? (
            <PreviewError>{previewData.error}</PreviewError>
          ) : (
            <>
              {previewData.type === 'image' && (
                <PreviewImage 
                  src={value} 
                  alt={previewData.title || 'Preview'}
                  onError={() => setPreviewData(prev => prev ? { ...prev, error: 'Failed to load image' } : null)}
                />
              )}
              
              {previewData.type === 'video' && (
                <PreviewVideo 
                  src={value} 
                  controls
                  onError={() => setPreviewData(prev => prev ? { ...prev, error: 'Failed to load video' } : null)}
                />
              )}
              
              {previewData.type === 'audio' && (
                <PreviewAudio 
                  src={value} 
                  controls
                  onError={() => setPreviewData(prev => prev ? { ...prev, error: 'Failed to load audio' } : null)}
                />
              )}
              
              {previewData.type === 'embed' && (
                <PreviewEmbed 
                  src={value}
                  title={previewData.title || 'Embedded content'}
                  onError={() => setPreviewData(prev => prev ? { ...prev, error: 'Failed to load embed' } : null)}
                />
              )}
              
              {previewData.title && (
                <URLInfo>
                  <URLInfoItem>
                    📁 {previewData.title}
                  </URLInfoItem>
                  <URLInfoItem>
                    🔗 {previewData.type.toUpperCase()}
                  </URLInfoItem>
                </URLInfo>
              )}
            </>
          )}
        </PreviewContent>
      </PreviewContainer>
    );
  };

  return (
    <FieldContainer>
      <Label required={required}>{label}</Label>
      
      <InputContainer>
        <URLInput
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          hasError={hasError}
          hasWarning={hasWarning}
        />
        
        <URLIcon isValid={isValidURL}>
          {isLoading ? <LoadingSpinner /> : isValidURL ? '✓' : '🔗'}
        </URLIcon>
      </InputContainer>
      
      {renderPreview()}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </FieldContainer>
  );
};
