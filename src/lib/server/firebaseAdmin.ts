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

function collectMissingEnv(): string[] {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    // DATABASE_URL handled separately (can be NEXT_PUBLIC_ variant)
  ];
  return required.filter(k => !process.env[k] || process.env[k] === '');
}

let adminApp: App | undefined;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const missing = collectMissingEnv();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseURL) missing.push('FIREBASE_DATABASE_URL');

  if (missing.length) {
    const msg = `Missing required Firebase env vars: ${missing.join(', ')}`;
    // On Vercel (production or preview) we want a hard failure so deployments surface misconfiguration.
    if (process.env.VERCEL) {
      throw new Error(msg);
    }
    // Locally (dev/test) fall back to a mock app that yields empty data.
    console.warn(`[firebaseAdmin] ${msg}. Returning a mock admin app; fetchArtworks() will return [].`);
    // Provide a dummy app-like object to satisfy getDatabase without real calls.
    // Instead of constructing a real Firebase app with invalid creds, we short-circuit in fetchArtworks.
    throw new Error(msg); // We will catch this in fetchArtworks and soft-fail locally.
  }

  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  const rawKey = getRequiredEnv('FIREBASE_PRIVATE_KEY');
  const privateKey = rawKey.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    databaseURL: databaseURL!,
  });
  return adminApp;
}

export async function fetchArtworks(): Promise<Artwork[]> {
  let app: App;
  try {
    app = getAdminApp();
  } catch (e) {
    // In local dev/test return empty instead of crashing entire render.
    if (!process.env.VERCEL) {
      console.warn('[firebaseAdmin] fetchArtworks soft-failed due to missing configuration; returning empty list.');
      return [];
    }
    throw e;
  }
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
