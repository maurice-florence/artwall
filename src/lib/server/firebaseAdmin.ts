// Server-only Firebase Admin initialization and data fetching
// This module must only be imported in Server Components or Route Handlers.

import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import type { Artwork } from '@/types';

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || v === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }
  // Expect env vars to be configured in Vercel and locally via .env
  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  // Private key may contain literal \n sequences; replace them
  const rawKey = getRequiredEnv('FIREBASE_PRIVATE_KEY');
  const privateKey = rawKey.replace(/\\n/g, '\n');
  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    throw new Error('Missing FIREBASE_DATABASE_URL or NEXT_PUBLIC_FIREBASE_DATABASE_URL');
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    databaseURL,
  });
  return adminApp;
}

export async function fetchArtworks(): Promise<Artwork[]> {
  const app = getAdminApp();
  const db = getDatabase(app);
  const snap = await db.ref('artwall').get();
  const val = snap.val() as Record<string, Record<string, any>> | null;
  if (!val) return [];

  const items: Artwork[] = [];
  for (const mediumKey of Object.keys(val)) {
    const group = val[mediumKey] || {};
    for (const id of Object.keys(group)) {
      const raw = group[id] || {};
      // Ensure id and medium exist
      raw.id = raw.id || id;
      raw.medium = raw.medium || mediumKey;
      // Normalize evaluation/rating numeric fields if present
      const evalRaw = raw.evaluationNum ?? raw.evaluation;
      const ratingRaw = raw.ratingNum ?? raw.rating;
      const evalNum = typeof evalRaw === 'number' ? evalRaw : (evalRaw ? Number(evalRaw) : NaN);
      const ratingNum = typeof ratingRaw === 'number' ? ratingRaw : (ratingRaw ? Number(ratingRaw) : NaN);
      if (!isNaN(evalNum)) raw.evaluationNum = evalNum;
      if (!isNaN(ratingNum)) raw.ratingNum = ratingNum;
      items.push(raw as Artwork);
    }
  }

  // Sort newest first by date like the client did
  items.sort((a, b) => {
    const aT = new Date(a.year, (a.month || 1) - 1, a.day || 1).getTime();
    const bT = new Date(b.year, (b.month || 1) - 1, b.day || 1).getTime();
    return bT - aT;
  });

  return items;
}
