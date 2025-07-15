# AdminModal Documentation
## filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\components\AdminModal\README.md

# AdminModal Component

A refactored, modular admin interface for creating and editing artworks.

## Overview

The AdminModal has been completely refactored from a monolithic 700+ line component into a modular, maintainable structure with proper separation of concerns.

## Architecture

```
AdminModal/
├── AdminModal.tsx           # Main component
├── index.ts                 # Export barrel
├── components/              # Form sections
│   ├── BasicInfoForm.tsx    # Title, category, date fields
│   ├── CategorySpecificFields.tsx  # Category-specific inputs
│   ├── MediaUploadSection.tsx      # File uploads and media URLs
│   ├── MetadataSection.tsx         # Version, language, tags
│   └── index.ts             # Component exports
├── hooks/                   # Custom hooks
│   ├── useAdminModal.ts     # Main form state management
│   └── useArtworkForm.ts    # Form utilities
├── styles/                  # Styled components
│   └── index.ts             # All styled components
├── types/                   # Type definitions
│   └── index.ts             # AdminModal-specific types
└── utils/                   # Utilities
    ├── firebaseOperations.ts # Database operations
    └── validation.ts         # Form validation
```

## Usage

### Basic Usage

```tsx
import AdminModal from '@/components/AdminModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [artworkToEdit, setArtworkToEdit] = useState(null);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      artworkToEdit={artworkToEdit}
    />
  );
}
```

### Creating New Artwork

```tsx
<AdminModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  artworkToEdit={null} // null for new artwork
/>
```

### Editing Existing Artwork

```tsx
<AdminModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  artworkToEdit={selectedArtwork}
/>
```

## Props

### AdminModalProps

```typescript
interface AdminModalProps {
  isOpen: boolean;           // Whether the modal is open
  onClose: () => void;       // Close handler
  artworkToEdit?: Artwork | null; // Artwork to edit (null for new)
}
```

## Components

### BasicInfoForm

Handles basic artwork information:
- Title (required)
- Category (required)
- Year (required)
- Month (optional)
- Day (optional)
- Description (optional)
- Content (optional)
- Hidden checkbox

### CategorySpecificFields

Renders fields based on selected category:
- **Music**: Lyrics, chords, SoundCloud URLs
- **Image/Video/Sculpture/Drawing**: Media type, media URL, extra URLs
- **Other**: Custom type field

### MediaUploadSection

Handles file uploads and media URLs:
- Media URL input
- Cover image URL input
- File upload input (supports images, audio, video, PDF)

### MetadataSection

Manages metadata fields:
- Version
- Language selection
- Tags (comma-separated)
- Hidden checkbox

## Hooks

### useAdminModal

Main hook for form state management:

```typescript
const {
  formData,      // Current form data
  errors,        // Validation errors
  isLoading,     // Loading state
  message,       // Success/error messages
  updateField,   // Update form field
  handleSubmit,  // Form submission
  resetForm      // Reset form to initial state
} = useAdminModal(artworkToEdit);
```

### useArtworkForm

Lower-level hook for form utilities:

```typescript
const {
  formData,
  formState,
  updateField,
  setError,
  setSuccess,
  setLoading,
  resetForm
} = useArtworkForm(artworkToEdit);
```

## Validation

Form validation is handled by the `validation.ts` utility:

```typescript
const errors = validateArtworkForm(formData);
```

### Validation Rules

- **Title**: Required, non-empty string
- **Year**: Required, between 1900 and current year + 1
- **Month**: Optional, between 1 and 12
- **Day**: Optional, between 1 and 31

## Firebase Operations

Database operations are handled by `firebaseOperations.ts`:

```typescript
// Create new artwork
const result = await createArtwork(formData);

// Update existing artwork
const result = await updateArtwork(id, formData);

// Fetch artwork
const result = await fetchArtwork(id);
```

## Styling

All styled components are organized in `styles/index.ts`:

- **ModalBackdrop**: Full-screen overlay
- **ModalContent**: Main modal container
- **FormWrapper**: Form layout container
- **FieldGroup**: Individual field container
- **Button/SecondaryButton**: Action buttons
- **Input/Textarea/Select**: Form inputs
- **ErrorMessage/SuccessMessage**: Feedback messages

## Testing

Comprehensive tests cover:
- Modal behavior (open/close)
- Form validation
- Component rendering
- User interactions
- Accessibility features

Run tests:
```bash
npm test AdminModal
```

## Migration from Old AdminModal

The old monolithic `AdminModal.tsx` has been replaced with this modular structure:

### Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Testability**: Components can be tested in isolation
3. **Reusability**: Form sections can be reused elsewhere
4. **Type Safety**: Proper TypeScript integration
5. **Performance**: Smaller bundle sizes through code splitting

### Breaking Changes

- Import path changed from `@/components/AdminModal` to `@/components/AdminModal/AdminModal`
- Component props remain the same
- Internal structure completely refactored

## Performance Considerations

- Components are lazy-loaded where possible
- Form state is optimized to prevent unnecessary re-renders
- Validation is debounced to improve performance
- File uploads are handled efficiently with progress indicators

## Accessibility

- Proper ARIA labels and descriptions
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Future Enhancements

- [ ] Add drag-and-drop file uploads
- [ ] Implement auto-save functionality
- [ ] Add batch operations
- [ ] Enhanced validation rules
- [ ] Multi-language support
- [ ] Rich text editor for content
- [ ] Image compression and optimization
- [ ] Offline support