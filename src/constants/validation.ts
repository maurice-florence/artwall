// src/constants/validation.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\constants\validation.ts
export const VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  YEAR_MIN: 1900,
  YEAR_MAX: new Date().getFullYear() + 1,
  MONTH_MIN: 1,
  MONTH_MAX: 12,
  DAY_MIN: 1,
  DAY_MAX: 31
} as const;