import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getServiceAccount } from './firebase-admin-config';

// The Singleton Check
const app = getApps().length > 0
  ? getApp()
  : initializeApp({
      credential: cert(getServiceAccount()),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

const db = getFirestore(app);

db.settings({ ignoreUndefinedProperties: true });

export { db };
