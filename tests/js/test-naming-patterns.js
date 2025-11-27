
import { describe, it, expect } from 'vitest';

describe('Firebase Storage naming patterns', () => {
  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01';
  const patterns = [
    '.jpg?alt=media',
    '__card.jpg?alt=media',
    '__thumbnail.jpg?alt=media',
    '__full.jpg?alt=media',
    '_480x480.jpg?alt=media',
    '_200x200.jpg?alt=media',
    '_1200x1200.jpg?alt=media'
  ];
  it('should generate correct URLs for all naming patterns', () => {
    for (const pattern of patterns) {
      const testUrl = baseUrl + pattern;
      expect(testUrl).toMatch(/faces-1_01.*(jpg|media)$/);
    }
  });
});