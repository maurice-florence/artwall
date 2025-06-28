export const atelierTheme = {
  body: '#F8F7F2',
  text: '#3D405B',
  headerBg: '#3D405B',
  headerText: '#F8F7F2',
  accent: '#E07A5F',
  accentText: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardText: '#3D405B',
  categories: {
    muziek: '#D94A4A',
    poëzie: '#2E86C1',
    proza: '#28B463',
    sculptuur: '#AF601A',
    tekening: '#884EA0',
  },
  cardBackgrounds: {
    default: '#FFFFFF',
    muziek: 'linear-gradient(145deg, #434343 0%, #212121 100%)',
    poëzie: 'repeating-linear-gradient(135deg, #f2f2f2 0px, #f2f2f2 8px, #e6e6e6 8px, #ffffff 16px)',
    proza: 'linear-gradient(120deg, #f8f5f0 0%, #ffffff 100%)',
    sculptuur: 'radial-gradient(circle at 30% 30%, #e8e8e8 60%, #f5f5f5 100%)',
    tekening: 'repeating-linear-gradient(120deg, #e8e8e8 0px, #e8e8e8 10px, #f5f5f5 10px, #f5f5f5 20px)',
  },
};

export const blueprintTheme = {
  body: '#EAF2F8',
  text: '#17202A',
  headerBg: '#2E86C1',
  headerText: '#FFFFFF',
  accent: '#1F618D',
  accentText: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardText: '#17202A',
  categories: {
    muziek: '#C0392B',
    poëzie: '#2980B9',
    proza: '#27AE60',
    sculptuur: '#D35400',
    tekening: '#8E44AD',
  },
  cardBackgrounds: {
    default: '#FFFFFF',
    muziek: 'linear-gradient(135deg, #1F618D 0%, #17202A 100%)',
    poëzie: 'repeating-linear-gradient(135deg, #eaf2f8 0px, #eaf2f8 8px, #d6eaf8 8px, #ffffff 16px)',
    proza: 'linear-gradient(120deg, #eafaf1 0%, #ffffff 100%)',
    sculptuur: 'radial-gradient(circle at 70% 70%, #fbeee6 60%, #eaf2f8 100%)',
    tekening: 'repeating-linear-gradient(120deg, #eaf2f8 0px, #eaf2f8 10px, #f8f9f9 10px, #f8f9f9 20px)',
  },
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
    muziek: '#CF6679',
    poëzie: '#74B9FF',
    proza: '#55E6C1',
    sculptuur: '#FFB74D',
    tekening: '#BA68C8',
  },
  cardBackgrounds: {
    default: '#1E2732',
    muziek: 'linear-gradient(145deg, #232526 0%, #414345 100%)',
    poëzie: 'repeating-linear-gradient(135deg, #232b36 0px, #232b36 8px, #1e2732 8px, #232b36 16px)',
    proza: 'linear-gradient(120deg, #232b36 0%, #1e2732 100%)',
    sculptuur: 'radial-gradient(circle at 30% 30%, #232b36 60%, #1e2732 100%)',
    tekening: 'repeating-linear-gradient(120deg, #232b36 0px, #232b36 10px, #1e2732 10px, #1e2732 20px)',
  },
};

// We export the themes so they can be used in the application
export const themes = {
  atelier: atelierTheme,
  blueprint: blueprintTheme,
  dark: darkModeTheme,
};

// EXPORTEER HET TYPE VAN ONS THEMA-OBJECT
export type Theme = typeof atelierTheme;
export type ThemeName = 'atelier' | 'blueprint' | 'dark';
