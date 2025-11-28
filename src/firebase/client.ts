// src/firebase/client.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; // 👈 Add this import


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // 👈 Make sure this is in your .env.local
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard: Throw a clear error if any config value is missing
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);
if (missingKeys.length > 0) {
  if (process.env.NODE_ENV === 'test') {
    // In test mode, just warn so mocks can work
    // eslint-disable-next-line no-console
    console.warn(
      `Firebase config warning: Missing environment variables for keys: ${missingKeys.join(", ")}.\n` +
      `Check your .env.local or environment setup if you need real Firebase in tests.`
    );
  } else {
    throw new Error(
      `Firebase config error: Missing environment variables for keys: ${missingKeys.join(", ")}.\n` +
      `Check your .env.local or environment setup.`
    );
  }
}


// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export the services you need
export const db = getFirestore(app); // This is for Firestore
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app); // 👈 Export the Realtime Database instance