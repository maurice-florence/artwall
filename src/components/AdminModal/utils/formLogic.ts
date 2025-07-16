// src/components/AdminModal/utils/formLogic.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\utils\formLogic.ts
import { ArtworkFormData, ArtworkCategory } from '@/types';

export interface ConditionalRule {
  field: keyof ArtworkFormData;
  condition: (formData: ArtworkFormData) => boolean;
  action: 'show' | 'hide' | 'require' | 'optional';
}

export interface DependencyRule {
  sourceField: keyof ArtworkFormData;
  targetField: keyof ArtworkFormData;
  transform: (sourceValue: any, formData: ArtworkFormData) => any;
}

export interface SmartDefault {
  field: keyof ArtworkFormData;
  getValue: (formData: ArtworkFormData) => any;
  conditions?: Array<(formData: ArtworkFormData) => boolean>;
}

// Conditional field rules - when to show/hide fields
export const CONDITIONAL_RULES: ConditionalRule[] = [
  // Music category rules
  {
    field: 'lyrics',
    condition: (data) => data.category === 'music',
    action: 'show'
  },
  {
    field: 'chords',
    condition: (data) => data.category === 'music',
    action: 'show'
  },
  {
    field: 'soundcloudEmbedUrl',
    condition: (data) => data.category === 'music',
    action: 'show'
  },
  {
    field: 'soundcloudTrackUrl',
    condition: (data) => data.category === 'music',
    action: 'show'
  },
  {
    field: 'audioUrl',
    condition: (data) => data.category === 'music',
    action: 'show'
  },
  
  // Visual arts rules
  {
    field: 'mediaType',
    condition: (data) => ['image', 'video', 'sculpture', 'drawing'].includes(data.category),
    action: 'show'
  },
  {
    field: 'mediaUrl',
    condition: (data) => ['image', 'video', 'sculpture', 'drawing'].includes(data.category),
    action: 'show'
  },
  {
    field: 'coverImageUrl',
    condition: (data) => ['prose', 'image', 'sculpture', 'drawing'].includes(data.category),
    action: 'show'
  },
  
  // Literature rules
  {
    field: 'pdfUrl',
    condition: (data) => ['prose', 'poetry', 'prosepoetry'].includes(data.category),
    action: 'show'
  },
  {
    field: 'content',
    condition: (data) => ['poetry', 'prosepoetry', 'prose'].includes(data.category),
    action: 'show'
  },
  
  // Advanced fields based on media type
  {
    field: 'mediaUrls',
    condition: (data) => data.mediaType === 'video' || data.mediaType === 'audio',
    action: 'show'
  },
  
  // Language fields - show additional languages if first is filled
  {
    field: 'language2',
    condition: (data) => !!data.language1,
    action: 'show'
  },
  {
    field: 'language3',
    condition: (data) => !!data.language2,
    action: 'show'
  },
  
  // URL fields - progressive disclosure
  {
    field: 'url2',
    condition: (data) => !!data.url1,
    action: 'show'
  },
  {
    field: 'url3',
    condition: (data) => !!data.url2,
    action: 'show'
  },
  
  // Location fields - show second location if first is filled
  {
    field: 'location2',
    condition: (data) => !!data.location1,
    action: 'show'
  }
];

// Field dependencies - auto-populate based on other fields
export const DEPENDENCY_RULES: DependencyRule[] = [
  // Auto-generate title suggestions based on category
  {
    sourceField: 'category',
    targetField: 'title',
    transform: (category: ArtworkCategory, formData) => {
      if (formData.title) return formData.title; // Don't override existing title
      
      const year = formData.year || new Date().getFullYear();
      const suggestions = {
        poetry: `Gedicht ${year}`,
        prosepoetry: `Proza-poëzie ${year}`,
        prose: `Verhaal ${year}`,
        music: `Compositie ${year}`,
        sculpture: `Sculptuur ${year}`,
        drawing: `Tekening ${year}`,
        image: `Afbeelding ${year}`,
        video: `Video ${year}`,
        other: `Kunstwerk ${year}`
      };
      
      return suggestions[category] || `Kunstwerk ${year}`;
    }
  },
  
  // Auto-set media type based on category
  {
    sourceField: 'category',
    targetField: 'mediaType',
    transform: (category: ArtworkCategory) => {
      const mediaTypeMap = {
        poetry: 'text',
        prosepoetry: 'text',
        prose: 'text',
        music: 'audio',
        sculpture: 'image',
        drawing: 'image',
        image: 'image',
        video: 'video',
        other: 'text'
      };
      
      return mediaTypeMap[category] || 'text';
    }
  },
  
  // Auto-generate version based on year
  {
    sourceField: 'year',
    targetField: 'version',
    transform: (year: number, formData) => {
      if (formData.version && formData.version !== '01') return formData.version;
      return '01'; // Default version
    }
  },
  
  // Auto-set language based on content detection
  {
    sourceField: 'content',
    targetField: 'language1',
    transform: (content: string, formData) => {
      if (formData.language1) return formData.language1;
      if (!content) return 'nl';
      
      // Simple language detection based on common words
      const dutchWords = ['de', 'het', 'een', 'en', 'van', 'te', 'dat', 'die', 'in', 'is'];
      const englishWords = ['the', 'and', 'to', 'of', 'a', 'in', 'that', 'have', 'it', 'for'];
      
      const words = content.toLowerCase().split(/\s+/).slice(0, 20);
      const dutchScore = words.filter(word => dutchWords.includes(word)).length;
      const englishScore = words.filter(word => englishWords.includes(word)).length;
      
      return dutchScore > englishScore ? 'nl' : 'en';
    }
  }
];

// Smart defaults - intelligent default values
export const SMART_DEFAULTS: SmartDefault[] = [
  {
    field: 'year',
    getValue: () => new Date().getFullYear()
  },
  {
    field: 'month',
    getValue: () => new Date().getMonth() + 1,
    conditions: [(data) => !data.year || data.year === new Date().getFullYear()]
  },
  {
    field: 'day',
    getValue: () => new Date().getDate(),
    conditions: [(data) => !data.year || data.year === new Date().getFullYear()]
  },
  {
    field: 'language1',
    getValue: () => 'nl'
  },
  {
    field: 'version',
    getValue: () => '01'
  },
  {
    field: 'mediaType',
    getValue: (data) => {
      const typeMap = {
        poetry: 'text',
        prosepoetry: 'text',
        prose: 'text',
        music: 'audio',
        sculpture: 'image',
        drawing: 'image',
        image: 'image',
        video: 'video',
        other: 'text'
      };
      return typeMap[data.category] || 'text';
    }
  }
];

// Helper functions
export const shouldShowField = (field: keyof ArtworkFormData, formData: ArtworkFormData): boolean => {
  const rule = CONDITIONAL_RULES.find(r => r.field === field);
  if (!rule) return true; // Show by default if no rule
  
  const shouldShow = rule.condition(formData);
  return rule.action === 'show' ? shouldShow : !shouldShow;
};

export const isFieldRequired = (field: keyof ArtworkFormData, formData: ArtworkFormData): boolean => {
  // Base required fields
  const baseRequiredFields: Array<keyof ArtworkFormData> = ['title', 'category', 'year'];
  if (baseRequiredFields.includes(field)) return true;
  
  // Conditional requirements
  const rule = CONDITIONAL_RULES.find(r => r.field === field && r.action === 'require');
  if (rule) return rule.condition(formData);
  
  // Category-specific requirements
  if (field === 'content' && ['poetry', 'prosepoetry', 'prose'].includes(formData.category)) {
    return true;
  }
  
  return false;
};

export const applyDependencies = (formData: ArtworkFormData, changedField: keyof ArtworkFormData): Partial<ArtworkFormData> => {
  const updates: Partial<ArtworkFormData> = {};
  
  DEPENDENCY_RULES.forEach(rule => {
    if (rule.sourceField === changedField) {
      const newValue = rule.transform(formData[changedField], formData);
      if (newValue !== formData[rule.targetField]) {
        updates[rule.targetField] = newValue;
      }
    }
  });
  
  return updates;
};

export const applySmartDefaults = (formData: ArtworkFormData): Partial<ArtworkFormData> => {
  const updates: Partial<ArtworkFormData> = {};
  
  SMART_DEFAULTS.forEach(defaultRule => {
    const currentValue = formData[defaultRule.field];
    
    // Only apply if field is empty and conditions are met
    if (!currentValue || (typeof currentValue === 'string' && currentValue.trim() === '')) {
      if (!defaultRule.conditions || defaultRule.conditions.every(condition => condition(formData))) {
        updates[defaultRule.field] = defaultRule.getValue(formData);
      }
    }
  });
  
  return updates;
};

export const getVisibleFields = (formData: ArtworkFormData): Array<keyof ArtworkFormData> => {
  const allFields: Array<keyof ArtworkFormData> = [
    'title', 'category', 'year', 'month', 'day', 'description', 'content',
    'lyrics', 'chords', 'soundcloudEmbedUrl', 'soundcloudTrackUrl', 'audioUrl',
    'mediaType', 'mediaUrl', 'mediaUrls', 'coverImageUrl', 'pdfUrl',
    'version', 'language1', 'language2', 'language3',
    'location1', 'location2', 'tags',
    'url1', 'url2', 'url3', 'isHidden'
  ];
  
  return allFields.filter(field => shouldShowField(field, formData));
};

// Form validation with smart logic
export const validateWithSmartLogic = (formData: ArtworkFormData): { errors: string[], warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  const visibleFields = getVisibleFields(formData);
  
  visibleFields.forEach(field => {
    if (isFieldRequired(field, formData)) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${field} is required for category ${formData.category}`);
      }
    }
  });
  
  // Smart warnings
  if (formData.category === 'music' && !formData.lyrics && !formData.audioUrl) {
    warnings.push('Consider adding lyrics or audio URL for music category');
  }
  
  if (formData.category === 'prose' && !formData.content && !formData.pdfUrl) {
    warnings.push('Prose works typically need content or PDF URL');
  }
  
  if (formData.year && formData.year > new Date().getFullYear()) {
    warnings.push('Future date detected - is this correct?');
  }
  
  return { errors, warnings };
};
