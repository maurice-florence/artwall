import React, { useContext, useRef } from 'react';
import styled from 'styled-components';
import { ThemeContext } from '@/context/ThemeContext';
import { Theme } from '@/themes';
import { FaSave } from 'react-icons/fa';

const EditorContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ColorCircleLabel = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
  border: 1px solid ${({ theme }) => theme.border};
`;

const HiddenColorInput = styled.input.attrs({ type: 'color' })`
  display: none;
`;

const SaveIconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.primary};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
`;

const ThemeEditor: React.FC = () => {
  const { themeObject, updateThemeColor, saveThemeAsDefault } = useContext(ThemeContext);

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (colorKey: keyof Theme, value: string) => {
    updateThemeColor(colorKey, value);
  };

  return (
    <EditorContainer>
      <ColorCircleLabel style={{ backgroundColor: themeObject.primary }} htmlFor="primary-color">
        P
        <HiddenColorInput
          id="primary-color"
          ref={primaryInputRef}
          value={themeObject.primary || '#000000'}
          onChange={(e) => handleColorChange('primary', e.target.value)}
        />
      </ColorCircleLabel>

      <ColorCircleLabel style={{ backgroundColor: themeObject.secondary }} htmlFor="secondary-color">
        S
        <HiddenColorInput
          id="secondary-color"
          ref={secondaryInputRef}
          value={themeObject.secondary || '#ffffff'}
          onChange={(e) => handleColorChange('secondary', e.target.value)}
        />
      </ColorCircleLabel>

      <ColorCircleLabel style={{ backgroundColor: themeObject.body }} htmlFor="background-color">
        B
        <HiddenColorInput
          id="background-color"
          ref={backgroundInputRef}
          value={themeObject.body || '#ffffff'}
          onChange={(e) => handleColorChange('body', e.target.value)}
        />
      </ColorCircleLabel>

      <SaveIconButton onClick={saveThemeAsDefault} title="Save as default">
        <FaSave />
      </SaveIconButton>
    </EditorContainer>
  );
};

export default ThemeEditor;