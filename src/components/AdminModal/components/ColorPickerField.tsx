// src/components/AdminModal/components/ColorPickerField.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\ColorPickerField.tsx
import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
  showPresets?: boolean;
  allowCustom?: boolean;
  format?: 'hex' | 'rgb' | 'hsl';
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
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

const ColorInputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ColorPreview = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background-color: ${({ color }) => color};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ color }) => color};
    z-index: 1;
  }
`;

const ColorInput = styled.input<{ hasError?: boolean; hasWarning?: boolean }>`
  flex: 1;
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
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent || '#E07A5F'}20;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const HiddenColorInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
`;

const PresetsContainer = styled.div`
  margin-top: 12px;
`;

const PresetsLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 8px;
  opacity: 0.8;
`;

const PresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 8px;
  max-width: 400px;
`;

const PresetColor = styled.div<{ color: string; isSelected?: boolean }>`
  width: 32px;
  height: 32px;
  border: 2px solid ${({ isSelected, theme }) => 
    isSelected ? theme.accent || '#E07A5F' : '#e5e7eb'};
  border-radius: 6px;
  background-color: ${({ color }) => color};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.1s;
  
  &:hover {
    transform: scale(1.05);
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 4px 4px;
    background-position: 0 0, 0 2px, 2px -2px, -2px 0px;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${({ color }) => color};
    z-index: 1;
  }
`;

const ColorInfo = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 16px;
`;

const ColorInfoItem = styled.span`
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

const FormatToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
`;

const FormatButton = styled.button<{ active?: boolean }>`
  padding: 4px 8px;
  border: 1px solid ${({ active, theme }) => 
    active ? theme.accent || '#E07A5F' : '#d1d5db'};
  border-radius: 4px;
  background-color: ${({ active, theme }) => 
    active ? theme.accent || '#E07A5F' : 'transparent'};
  color: ${({ active, theme }) => 
    active ? '#ffffff' : theme.text};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.accent || '#E07A5F'};
    color: #ffffff;
  }
`;

const DEFAULT_PRESETS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#FFB6C1', '#87CEFA', '#DEB887',
  '#F0E68C', '#E6E6FA', '#FFE4B5', '#D3D3D3', '#B0C4DE',
  '#FF7F50', '#32CD32', '#FF69B4', '#1E90FF', '#FFD700',
  '#FF4500', '#00CED1', '#FF1493', '#00FF7F', '#DC143C',
  '#8A2BE2', '#228B22', '#FF8C00', '#00BFFF', '#DAA520'
];

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  showPresets = true,
  allowCustom = true,
  format = 'hex',
  disabled = false,
  required = false,
  helpText,
  hasError = false,
  hasWarning = false
}) => {
  const [currentFormat, setCurrentFormat] = useState<'hex' | 'rgb' | 'hsl'>(format);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }, []);

  const rgbToHex = useCallback((r: number, g: number, b: number) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }, []);

  const rgbToHsl = useCallback((r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  const formatColor = useCallback((color: string, targetFormat: 'hex' | 'rgb' | 'hsl') => {
    if (!color || !color.startsWith('#')) return color;
    
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    switch (targetFormat) {
      case 'hex':
        return color;
      case 'rgb':
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl':
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      default:
        return color;
    }
  }, [hexToRgb, rgbToHsl]);

  const normalizeColor = useCallback((color: string): string => {
    if (color.startsWith('#')) return color;
    
    // Convert RGB to hex
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return rgbToHex(r, g, b);
    }
    
    // For HSL, would need more complex conversion
    return color;
  }, [rgbToHex]);

  const handleColorChange = useCallback((newColor: string) => {
    const normalizedColor = normalizeColor(newColor);
    onChange(normalizedColor);
  }, [onChange, normalizeColor]);

  const handlePresetClick = useCallback((preset: string) => {
    handleColorChange(preset);
  }, [handleColorChange]);

  const handleColorInputClick = useCallback(() => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  }, []);

  const handleFormatChange = useCallback((newFormat: 'hex' | 'rgb' | 'hsl') => {
    setCurrentFormat(newFormat);
  }, []);

  const displayValue = formatColor(value, currentFormat);
  const normalizedValue = normalizeColor(value);

  return (
    <FieldContainer>
      <Label required={required}>{label}</Label>
      
      <ColorInputContainer>
        <ColorPreview 
          color={normalizedValue || '#ffffff'} 
          onClick={allowCustom ? handleColorInputClick : undefined}
        />
        
        <ColorInput
          type="text"
          value={displayValue}
          onChange={(e) => handleColorChange(e.target.value)}
          disabled={disabled}
          hasError={hasError}
          hasWarning={hasWarning}
          placeholder={`Enter ${currentFormat.toUpperCase()} color`}
        />
        
        {allowCustom && (
          <HiddenColorInput
            ref={colorInputRef}
            type="color"
            value={normalizedValue || '#ffffff'}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={disabled}
          />
        )}
      </ColorInputContainer>
      
      {allowCustom && (
        <FormatToggle>
          <FormatButton 
            active={currentFormat === 'hex'}
            onClick={() => handleFormatChange('hex')}
          >
            HEX
          </FormatButton>
          <FormatButton 
            active={currentFormat === 'rgb'}
            onClick={() => handleFormatChange('rgb')}
          >
            RGB
          </FormatButton>
          <FormatButton 
            active={currentFormat === 'hsl'}
            onClick={() => handleFormatChange('hsl')}
          >
            HSL
          </FormatButton>
        </FormatToggle>
      )}
      
      {showPresets && presets.length > 0 && (
        <PresetsContainer>
          <PresetsLabel>Color Presets</PresetsLabel>
          <PresetsGrid>
            {presets.map((preset, index) => (
              <PresetColor
                key={index}
                color={preset}
                isSelected={normalizedValue === preset}
                onClick={() => handlePresetClick(preset)}
                title={preset}
              />
            ))}
          </PresetsGrid>
        </PresetsContainer>
      )}
      
      {normalizedValue && (
        <ColorInfo>
          <ColorInfoItem>
            🎨 {normalizedValue.toUpperCase()}
          </ColorInfoItem>
          {hexToRgb(normalizedValue) && (
            <ColorInfoItem>
              🔍 RGB({hexToRgb(normalizedValue)!.r}, {hexToRgb(normalizedValue)!.g}, {hexToRgb(normalizedValue)!.b})
            </ColorInfoItem>
          )}
        </ColorInfo>
      )}
      
      {helpText && <HelpText>{helpText}</HelpText>}
    </FieldContainer>
  );
};
