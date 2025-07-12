// src/constants/categories.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\constants\categories.ts
export const CATEGORIES = [
  'poetry', 'prosepoetry', 'prose', 'music', 
  'sculpture', 'drawing', 'image', 'video', 'other'
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  poetry: 'Poëzie',
  prosepoetry: 'Proza Poëzie',
  prose: 'Proza',
  music: 'Muziek',
  sculpture: 'Beeldhouwkunst',
  drawing: 'Tekeningen',
  image: 'Afbeeldingen',
  video: 'Video',
  other: 'Overig'
};