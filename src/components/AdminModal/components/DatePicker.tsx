// src/components/AdminModal/components/DatePicker.tsx
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\components\DatePicker.tsx
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

interface DatePickerProps {
  label: string;
  value?: { year?: number; month?: number; day?: number };
  onChange: (date: { year?: number; month?: number; day?: number }) => void;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  showTime?: boolean;
  minYear?: number;
  maxYear?: number;
}

const DateContainer = styled.div`
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

const DateFieldsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DateField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  opacity: 0.7;
  font-weight: 500;
`;

const DateInput = styled.input<{ hasError?: boolean }>`
  padding: 8px 12px;
  border: 2px solid ${({ hasError }) => hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 6px;
  font-size: 14px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  width: 80px;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent || '#E07A5F'}20;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const DateSelect = styled.select<{ hasError?: boolean }>`
  padding: 8px 12px;
  border: 2px solid ${({ hasError }) => hasError ? '#dc2626' : '#d1d5db'};
  border-radius: 6px;
  font-size: 14px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  color: ${({ theme }) => theme.text};
  width: 100px;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent || '#E07A5F'};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.accent || '#E07A5F'}20;
  }
  
  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const QuickDateButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const QuickDateButton = styled.button`
  padding: 4px 8px;
  border: 1px solid ${({ theme }) => theme.accent || '#E07A5F'};
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.accent || '#E07A5F'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.accent || '#E07A5F'};
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DatePreview = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.cardBg || '#ffffff'};
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  opacity: 0.8;
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

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value = {},
  onChange,
  required = false,
  disabled = false,
  helpText,
  showTime = false,
  minYear = 1900,
  maxYear = new Date().getFullYear() + 10
}) => {
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maart' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Augustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const validateDate = useCallback((year?: number, month?: number, day?: number): boolean => {
    setError(null);
    
    if (required && !year) {
      setError('Jaar is verplicht');
      return false;
    }
    
    if (year && (year < minYear || year > maxYear)) {
      setError(`Jaar moet tussen ${minYear} en ${maxYear} liggen`);
      return false;
    }
    
    if (month && (month < 1 || month > 12)) {
      setError('Ongeldige maand');
      return false;
    }
    
    if (day && (day < 1 || day > 31)) {
      setError('Ongeldige dag');
      return false;
    }
    
    // Check if day is valid for the given month/year
    if (year && month && day) {
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        setError(`Deze maand heeft slechts ${daysInMonth} dagen`);
        return false;
      }
    }
    
    return true;
  }, [required, minYear, maxYear]);

  const handleYearChange = useCallback((newYear: string) => {
    const year = newYear ? parseInt(newYear) : undefined;
    if (validateDate(year, value.month, value.day)) {
      onChange({ ...value, year });
    }
  }, [value, onChange, validateDate]);

  const handleMonthChange = useCallback((newMonth: string) => {
    const month = newMonth ? parseInt(newMonth) : undefined;
    if (validateDate(value.year, month, value.day)) {
      onChange({ ...value, month });
    }
  }, [value, onChange, validateDate]);

  const handleDayChange = useCallback((newDay: string) => {
    const day = newDay ? parseInt(newDay) : undefined;
    if (validateDate(value.year, value.month, day)) {
      onChange({ ...value, day });
    }
  }, [value, onChange, validateDate]);

  const handleQuickDate = useCallback((type: 'today' | 'clear') => {
    if (type === 'today') {
      onChange({ year: currentYear, month: currentMonth, day: currentDay });
    } else if (type === 'clear') {
      onChange({});
    }
  }, [onChange, currentYear, currentMonth, currentDay]);

  const formatDatePreview = useCallback(() => {
    if (!value.year) return '';
    
    let preview = value.year.toString();
    
    if (value.month) {
      const monthName = months.find(m => m.value === value.month)?.label;
      preview += ` ${monthName}`;
      
      if (value.day) {
        preview += ` ${value.day}`;
      }
    }
    
    return preview;
  }, [value, months]);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <DateContainer>
      <Label required={required}>{label}</Label>
      
      <DateFieldsContainer>
        <DateField>
          <DateLabel>Jaar</DateLabel>
          <DateSelect
            value={value.year || ''}
            onChange={(e) => handleYearChange(e.target.value)}
            disabled={disabled}
            hasError={!!error}
          >
            <option value="">-</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </DateSelect>
        </DateField>

        <DateField>
          <DateLabel>Maand</DateLabel>
          <DateSelect
            value={value.month || ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            disabled={disabled || !value.year}
            hasError={!!error}
          >
            <option value="">-</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </DateSelect>
        </DateField>

        <DateField>
          <DateLabel>Dag</DateLabel>
          <DateSelect
            value={value.day || ''}
            onChange={(e) => handleDayChange(e.target.value)}
            disabled={disabled || !value.year || !value.month}
            hasError={!!error}
          >
            <option value="">-</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </DateSelect>
        </DateField>
      </DateFieldsContainer>

      <QuickDateButtons>
        <QuickDateButton
          type="button"
          onClick={() => handleQuickDate('today')}
          disabled={disabled}
        >
          Vandaag
        </QuickDateButton>
        <QuickDateButton
          type="button"
          onClick={() => handleQuickDate('clear')}
          disabled={disabled}
        >
          Wissen
        </QuickDateButton>
      </QuickDateButtons>

      {formatDatePreview() && (
        <DatePreview>
          {formatDatePreview()}
        </DatePreview>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {helpText && <HelpText>{helpText}</HelpText>}
    </DateContainer>
  );
};
