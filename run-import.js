// run-import.js

// Dit script leest uw CSV-bestand, transformeert de data,
// en uploadt deze naar uw Firebase Realtime Database.

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CONFIGURATIE ---
// Pas deze twee waarden aan naar uw specifieke Firebase project details.
const DATABASE_URL = "https://artwall-by-jr-default-rtdb.europe-west1.firebasedatabase.app/";
const STORAGE_BUCKET = "https://console.firebase.google.com/project/artwall-by-jr/storage/artwall-by-jr.firebasestorage.app";
const CSV_FILENAME = "20250704_kunstmuur_import_01.csv"; // De naam van uw CSV-bestand
// --------------------

// Bepaal het absolute pad naar de map waar dit script staat
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bouw de volledige paden naar de benodigde bestanden
const csvFilePath = path.join(__dirname, CSV_FILENAME);
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey_artwall.json');

// Laad de geheime service account sleutel van het correcte pad
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialiseer de Firebase Admin App
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: DATABASE_URL,
});

const db = getDatabase();
const artworksRef = db.ref('artworks');

const results = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log('CSV-bestand succesvol gelezen. Start import naar Firebase...');

    for (const row of results) {
      // Bouw het basis object
      const artworkObject = {
        title: row.title || '',
        year: parseInt(row.year, 10) || 0,
        month: parseInt(row.month, 10) || 1,
        day: parseInt(row.day, 10) || 1,
        location1: row.location1 || '',
        location2: row.location2 || '',
        category: row.category || 'overig',
        description: row.description || '',
        tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
        recordCreationDate: Date.now(),
        isHidden: false,
      };

      // Helper functie om Storage URL's te bouwen
      const buildStorageUrl = (filename) => {
        if (!filename) return '';
        // Encode de bestandsnaam om speciale tekens (zoals spaties) te verwerken
        const encodedFilename = encodeURIComponent(filename);
        return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${row.category}%2F${encodedFilename}?alt=media`;
      };

      // Voeg conditioneel de media-gerelateerde velden toe
      if (row.primaryMediaFilename) {
        artworkObject.mediaUrl = buildStorageUrl(row.primaryMediaFilename);
      }
      if (row.coverImageFilename) {
        artworkObject.coverImageUrl = buildStorageUrl(row.coverImageFilename);
      }
      if (row.secondaryTextFilename) {
        artworkObject.textFileUrl = buildStorageUrl(row.secondaryTextFilename);
      }
      if (row.soundcloudEmbedUrl) {
        artworkObject.soundcloudEmbedUrl = row.soundcloudEmbedUrl;
      }
      if (row.soundcloudTrackUrl) {
        artworkObject.soundcloudTrackUrl = row.soundcloudTrackUrl;
      }

      // Push het volledige object naar de database
      try {
        await artworksRef.push(artworkObject);
        console.log(`✅ Succesvol geïmporteerd: ${artworkObject.title}`);
      } catch (error) {
        console.error(`❌ Fout bij importeren van ${artworkObject.title}:`, error);
      }
    }

    console.log('\nImport voltooid!');
    process.exit(0);
  });
