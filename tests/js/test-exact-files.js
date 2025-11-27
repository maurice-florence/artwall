
import { describe, it, expect } from 'vitest';

describe('Exact file URLs from sync output', () => {
  const exactFiles = [
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20200326_drawing_marker_disgust_01.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191204_drawing_marker_cracks_01.jpg?alt=media'
  ];
  const resizedFiles = [
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20191029_drawing_marker_faces-1_01_480x480.jpg?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/artwall-by-jr.appspot.com/o/drawing%2F20200326_drawing_marker_disgust_01_480x480.jpg?alt=media'
  ];
  it('should have correct original file URLs', () => {
    for (const url of exactFiles) {
      expect(url).toMatch(/drawing.*\.jpg\?alt=media$/);
    }
  });
  it('should have correct resized file URLs', () => {
    for (const url of resizedFiles) {
      expect(url).toMatch(/_480x480\.jpg\?alt=media$/);
    }
  });
});