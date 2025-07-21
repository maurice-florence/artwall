import { validateArtworkForm } from './validation';

describe('validateArtworkForm', () => {
  it('returns errors for invalid input', () => {
    // Provide minimal valid ArtworkFormData
    const result = validateArtworkForm({
      title: '',
      year: 0,
      medium: 'drawing',
      subtype: 'sketch',
      language1: 'nl',
    });
    expect(result).toBeDefined();
    expect(result.title).toBe('Titel is verplicht');
  });
});
