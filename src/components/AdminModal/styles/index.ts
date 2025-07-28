// src/components/AdminModal/styles/index.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\styles\index.ts
import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  padding: 2rem 2.5rem 2.5rem 2.5rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #E07A5F;
  cursor: pointer;
  
  &:hover {
    color: #d66a4a;
  }
`;

export const FormWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

export const SectionTitle = styled.h3`
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #E07A5F;
  margin: 1.5rem 0 1rem 0;
  border-bottom: 2px solid #E07A5F;
  padding-bottom: 0.5rem;
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #E07A5F;
    box-shadow: 0 0 0 2px rgba(224, 122, 95, 0.2);
  }
`;

export const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #E07A5F;
    box-shadow: 0 0 0 2px rgba(224, 122, 95, 0.2);
  }
`;

export const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #E07A5F;
    box-shadow: 0 0 0 2px rgba(224, 122, 95, 0.2);
  }
`;

export const Button = styled.button`
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  background: #E07A5F;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: #d66a4a;
  }
`;

export const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

export const SuccessMessage = styled.div`
  color: #27ae60;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: #E07A5F;
`;

export const FileInput = styled.input.attrs({ type: 'file' })`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #f9f9f9;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

export const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  background: #fff;
  color: #E07A5F;
  border: 2px solid #E07A5F;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  
  &:hover {
    background: #f5f5f5;
  }
`;