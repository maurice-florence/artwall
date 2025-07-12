// src/utils/firebase-operations.ts
export const uploadArtwork = async (artwork: ArtworkFormData) => {
  try {
    const result = await push(ref(db, 'artworks'), artwork);
    return { success: true, id: result.key };
  } catch (error) {
    console.error('Failed to upload artwork:', error);
    return { success: false, error: error.message };
  }
};