export const atelierTheme = {
  body: '#ffffff',
  text: '#3D405B',
  headerBg: '#0b8783',
  headerText: '#F8F7F2',
  accent: '#E07A5F',
  accentText: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardText: '#3D405B',
  categories: {
    music: '#D94A4A',
    // Audio subcategories
    beat: '#E57373',         // lighter red
    electronic: '#B71C1C',   // darker red
    other: '#FF8A65',        // orange-red
    rap: '#C62828',          // deep red
    song: '#FF5252',         // vivid red
    soundpoem: '#FFB3B3',    // pale red
    // Writing subcategories
    essay: '#28B463',        // same as prose (green)
    novel: '#239B56',        // darker green
    poem: '#2E86C1',
    prosepoem: '#A569BD',
    prose: '#28B463',
    shortstory: '#58D68D',   // lighter green
    // Sculpture subcategory
    sculpture: '#AF601A',
    clay: '#D68910',         // lighter brown-orange
    // Drawing subcategories
    drawing: '#884EA0',
    digital: '#BB8FCE',      // lighter purple
    marker: '#512E5F',       // darker purple
    pencil: '#A569BD',       // mid purple
  },
  cardBackgrounds: {
    default: '#FFFFFF',
    music: 'linear-gradient(145deg, #434343 0%, #212121 100%)',
    poem: 'repeating-linear-gradient(135deg, #f2f2f2 0px, #f2f2f2 8px, #e6e6e6 8px, #ffffff 16px)',
    prose: 'linear-gradient(120deg, #f8f5f0 0%, #ffffff 100%)',
    sculpture: 'radial-gradient(circle at 30% 30%, #e8e8e8 60%, #f5f5f5 100%)',
    drawing: 'repeating-linear-gradient(120deg, #e8e8e8 0px, #e8e8e8 10px, #f5f5f5 10px, #f5f5f5 20px)',
  },
  primary: '#0b8783',      // Teal (180°) - Poetry/Writing
  secondary: '#E85D4F',    // Coral-Red (10°) - Audio/Music
  tertiary: '#F4A742',     // Amber (40°) - Visual Arts
  quaternary: '#4A90E2',   // Deep Blue (210°) - Sculpture
  inactive: '#94A3A8',     // Desaturated teal - Inactive elements
  cardHeight: 360,
  gridGap: 24,
  border: '#d1d5db',
  textSecondary: '#6b7280',
};

export const blueprintTheme = {
  body: '#ffffff',
  text: '#17202A',
  headerBg: '#0b8783',
  headerText: '#FFFFFF',
  accent: '#1F618D',
  accentText: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardText: '#17202A',
  categories: {
    music: '#C0392B',
    // Audio subcategories
    beat: '#E57373',
    electronic: '#922B21',
    other: '#FF8A65',
    rap: '#A93226',
    song: '#FF5252',
    soundpoem: '#F5B7B1',
    // Writing subcategories
    essay: '#27AE60',
    novel: '#229954',
    poem: '#2980B9',
    prosepoem: '#8E44AD',
    prose: '#27AE60',
    shortstory: '#58D68D',
    // Sculpture subcategory
    sculpture: '#D35400',
    clay: '#F5B041',
    // Drawing subcategories
    drawing: '#16A085',
    digital: '#48C9B0',
    marker: '#117864',
    pencil: '#76D7C4',
  },
  cardBackgrounds: {
    default: '#FFFFFF',
    music: 'linear-gradient(135deg, #1F618D 0%, #17202A 100%)',
    poem: 'repeating-linear-gradient(135deg, #eaf2f8 0px, #eaf2f8 8px, #d6eaf8 8px, #ffffff 16px)',
    prose: 'linear-gradient(120deg, #eafaf1 0%, #ffffff 100%)',
    sculpture: 'radial-gradient(circle at 70% 70%, #fbeee6 60%, #eaf2f8 100%)',
    drawing: 'repeating-linear-gradient(120deg, #eaf2f8 0px, #eaf2f8 10px, #f8f9f9 10px, #f8f9f9 20px)',
  },
  primary: '#0b8783',      // Teal (180°) - Poetry/Writing
  secondary: '#E85D4F',    // Coral-Red (10°) - Audio/Music
  tertiary: '#F4A742',     // Amber (40°) - Drawing
  quaternary: '#4A90E2',   // Deep Blue (210°) - Sculpture
  inactive: '#94A3A8',     // Desaturated teal - Inactive elements
  cardHeight: 360,
  gridGap: 16,
  border: '#d1d5db',
  textSecondary: '#6b7280',
};

export const darkModeTheme = {
  body: '#17202A',
  text: '#EAF2F8',
  headerBg: '#000000',
  headerText: '#EAF2F8',
  accent: '#BB86FC',
  accentText: '#000000',
  cardBg: '#1E2732',
  cardText: '#EAF2F8',
  categories: {
    music: '#CF6679',
    // Audio subcategories
    beat: '#FF8A80',
    electronic: '#B71C1C',
    other: '#FFB3B3',
    rap: '#C62828',
    song: '#FF5252',
    soundpoem: '#F8BBD0',
    // Writing subcategories
    essay: '#55E6C1',
    novel: '#00BFAE',
    poem: '#74B9FF',
    prosepoem: '#BB8FCE',
    prose: '#55E6C1',
    shortstory: '#A7FFEB',
    // Sculpture subcategory
    sculpture: '#FFB74D',
    clay: '#FFD180',
    // Drawing subcategories
    drawing: '#BA68C8',
    digital: '#E1BEE7',
    marker: '#6A1B9A',
    pencil: '#CE93D8',
  },
  cardBackgrounds: {
    default: '#1E2732',
    music: 'linear-gradient(145deg, #232526 0%, #414345 100%)',
    poem: 'repeating-linear-gradient(135deg, #232b36 0px, #232b36 8px, #1e2732 8px, #232b36 16px)',
    prose: 'linear-gradient(120deg, #232b36 0%, #1e2732 100%)',
    sculpture: 'radial-gradient(circle at 30% 30%, #232b36 60%, #1e2732 100%)',
    drawing: 'repeating-linear-gradient(120deg, #232b36 0px, #232b36 10px, #1e2732 10px, #1e2732 20px)',
  },
  primary: '#0b8783',      // Teal (180°) - Poetry/Writing
  secondary: '#E85D4F',    // Coral-Red (10°) - Audio/Music
  tertiary: '#F4A742',     // Amber (40°) - Drawing
  quaternary: '#4A90E2',   // Deep Blue (210°) - Sculpture
  inactive: '#94A3A8',     // Desaturated teal - Inactive elements
  cardHeight: 360,
  gridGap: 16,
  border: '#d1d5db',
  textSecondary: '#6b7280',
};

export const natureTheme = {
  body: '#ffffff', // standard background
  text: '#2C3E50',
  headerBg: '#7FB77E', // leaf green
  headerText: '#F8F7F2',
  accent: '#4FC3F7', // sky blue
  accentText: '#FFFFFF',
  cardBg: '#F4F1EE',
  cardText: '#2C3E50',
  categories: {
    music: '#388E3C', // green
    poem: '#0288D1', // blue
    prosepoem: '#8D6E63', // brown
    prose: '#6D4C41', // dark brown
    sculpture: '#A1887F', // light brown
    drawing: '#90A4AE', // gray
  },
  cardBackgrounds: {
    default: '#F4F1EE',
    music: 'linear-gradient(135deg, #A8E063 0%, #56AB2F 100%)',
    poem: 'linear-gradient(135deg, #81D4FA 0%, #0288D1 100%)',
    prosepoem: 'linear-gradient(135deg, #BCAAA4 0%, #8D6E63 100%)',
    prose: 'linear-gradient(135deg, #A1887F 0%, #6D4C41 100%)',
    sculpture: 'linear-gradient(135deg, #D7CCC8 0%, #A1887F 100%)',
    drawing: 'linear-gradient(135deg, #CFD8DC 0%, #90A4AE 100%)',
  },
  primary: '#0b8783',      // Teal (180°) - Poetry/Writing
  secondary: '#E85D4F',    // Coral-Red (10°) - Audio/Music
  tertiary: '#F4A742',     // Amber (40°) - Drawing
  quaternary: '#4A90E2',   // Deep Blue (210°) - Sculpture
  inactive: '#94A3A8',     // Desaturated teal - Inactive elements
  cardHeight: 360,
  gridGap: 24,
  border: '#d1d5db',
  textSecondary: '#6b7280',
};

export const earthTheme = {
  body: '#ffffff',
  text: '#3E2723',
  headerBg: '#795548', // brown
  headerText: '#FFFFFF',
  accent: '#90CAF9', // sky blue
  accentText: '#3E2723',
  cardBg: '#ECEFF1',
  cardText: '#3E2723',
  categories: {
    music: '#388E3C', // green
    poem: '#1976D2', // blue
    prosepoem: '#8D6E63', // brown
    prose: '#5D4037', // dark brown
    sculpture: '#A1887F', // light brown
    drawing: '#757575', // gray
  },
  cardBackgrounds: {
    default: '#ECEFF1',
    music: 'linear-gradient(135deg, #A5D6A7 0%, #388E3C 100%)',
    poem: 'linear-gradient(135deg, #90CAF9 0%, #1976D2 100%)',
    prosepoem: 'linear-gradient(135deg, #BCAAA4 0%, #8D6E63 100%)',
    prose: 'linear-gradient(135deg, #A1887F 0%, #5D4037 100%)',
    sculpture: 'linear-gradient(135deg, #D7CCC8 0%, #A1887F 100%)',
    drawing: 'linear-gradient(135deg, #BDBDBD 0%, #757575 100%)',
  },
  primary: '#0b8783',      // Teal (180°) - Poetry/Writing
  secondary: '#E85D4F',    // Coral-Red (10°) - Audio/Music
  tertiary: '#F4A742',     // Amber (40°) - Drawing
  quaternary: '#4A90E2',   // Deep Blue (210°) - Sculpture
  inactive: '#94A3A8',     // Desaturated teal - Inactive elements
  cardHeight: 360,
  gridGap: 24,
  border: '#d1d5db',
  textSecondary: '#6b7280',
};

export const tealTheme = {
  body: '#ffffff',
  text: '#004D40',
  headerBg: '#00796B',
  headerText: '#FFFFFF',
  accent: '#00BFA5',
  accentText: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardText: '#004D40',
  categories: {
    music: '#00796B',
    poem: '#00BFA5',
    prosepoem: '#4DB6AC',
    prose: '#80CBC4',
    sculpture: '#26A69A',
    drawing: '#00897B',
  },
  cardBackgrounds: {
    default: '#FFFFFF',
    music: 'linear-gradient(135deg, #00796B 0%, #004D40 100%)',
    poem: 'repeating-linear-gradient(135deg, #e0f2f1 0px, #e0f2f1 8px, #b2dfdb 8px, #ffffff 16px)',
    prose: 'linear-gradient(120deg, #e0f2f1 0%, #ffffff 100%)',
    sculpture: 'radial-gradient(circle at 70% 70%, #b2dfdb 60%, #e0f2f1 100%)',
    drawing: 'repeating-linear-gradient(120deg, #e0f2f1 0px, #e0f2f1 10px, #f8f9f9 10px, #f8f9f9 20px)',
  },
  primary: '#0b8783',      // Teal (180°) - Poetry/Writing
  secondary: '#E85D4F',    // Coral-Red (10°) - Audio/Music
  tertiary: '#F4A742',     // Amber (40°) - Drawing
  quaternary: '#4A90E2',   // Deep Blue (210°) - Sculpture
  inactive: '#94A3A8',     // Desaturated teal - Inactive elements
  cardHeight: 360,
  gridGap: 16,
  border: '#B2DFDB',
  textSecondary: '#00695C',
};

export const themes = {
  blueprint: blueprintTheme,
  dark: darkModeTheme,
  teal: tealTheme,
};

export interface Theme {
  body: string;
  text: string;
  headerBg: string;
  headerText: string;
  accent: string;
  accentText: string;
  cardBg: string;
  cardText: string;
  categories: {
    music: string;
    poem: string;
    prosepoem: string;
    prose: string;
    sculpture: string;
    drawing: string;
  };
  cardBackgrounds: {
    default: string;
    music: string;
    poem: string;
    prose: string;
    sculpture: string;
    drawing: string;
  };
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  inactive: string;
  cardHeight: number;
  gridGap: number;
  border: string;
  textSecondary: string;
}

export type ThemeName = 'blueprint' | 'dark' | 'teal';
