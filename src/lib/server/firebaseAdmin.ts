// Server-only Firebase Admin initialization and data fetching
// This module must only be imported in Server Components or Route Handlers.

import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import type { Artwork } from '@/types';

// DEBUG LOG: File loaded
console.log('[firebaseAdmin] Module loaded');

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
  console.log('[firebaseAdmin] getAdminApp called');
  if (adminApp) {
    console.log('[firebaseAdmin] Returning cached adminApp');
    return adminApp;
  }
  if (getApps().length) {
    adminApp = getApps()[0]!;
    console.log('[firebaseAdmin] Returning existing app from getApps');
    return adminApp;
  }

  const missing = collectMissingEnv();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  if (!databaseURL) missing.push('FIREBASE_DATABASE_URL');

  console.log('[firebaseAdmin] Env check, missing:', missing);
  if (missing.length) {
    const msg = `Missing required Firebase env vars: ${missing.join(', ')}`;
    if (process.env.VERCEL) {
      console.log('[firebaseAdmin] Throwing error due to missing env on Vercel:', msg);
      throw new Error(msg);
    }
    console.warn(`[firebaseAdmin] ${msg}. Returning a mock admin app; fetchArtworks() will return [].`);
    throw new Error(msg); // We will catch this in fetchArtworks and soft-fail locally.
  }

  const projectId = getRequiredEnv('FIREBASE_PROJECT_ID');
  const clientEmail = getRequiredEnv('FIREBASE_CLIENT_EMAIL');
  let rawKey = getRequiredEnv('FIREBASE_PRIVATE_KEY');
  let parsedFromJson = false;
  // If the secret stored is the full service account JSON, extract private_key
  if (rawKey.trim().startsWith('{')) {
    try {
      const svc = JSON.parse(rawKey);
      if (svc.private_key) {
        rawKey = svc.private_key as string;
        parsedFromJson = true;
      } else {
        console.warn('[firebaseAdmin] JSON secret did not contain private_key field.');
      }
    } catch (e) {
      console.warn('[firebaseAdmin] Failed to parse JSON service account secret:', e);
    }
  }
  // Support both secret manager multi-line PEM and escaped \\n form
  const privateKey = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;
  const hasPemMarkers = privateKey.includes('-----BEGIN PRIVATE KEY-----') && privateKey.includes('-----END PRIVATE KEY-----');
  console.log('[firebaseAdmin] Private key length:', privateKey.length, 'escaped?', rawKey.includes('\\n'), 'parsedFromJson?', parsedFromJson, 'hasPemMarkers?', hasPemMarkers);
  if (!hasPemMarkers) {
    throw new Error('Invalid private key format: PEM markers missing');
  }

  console.log('[firebaseAdmin] Initializing Firebase Admin app');
  adminApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    databaseURL: databaseURL!,
  });
  return adminApp;
}

export async function fetchArtworks(): Promise<Artwork[]> {
  console.log('[firebaseAdmin] fetchArtworks called');
  let app: App;
  try {
    app = getAdminApp();
  } catch (e) {
    // In local dev/test return empty instead of crashing entire render.
    if (!process.env.VERCEL) {
      console.warn('[firebaseAdmin] fetchArtworks soft-failed due to missing configuration; returning empty list.');
      return [];
    }
    console.log('[firebaseAdmin] getAdminApp threw error:', e);
    throw e;
  }
  const db = getDatabase(app);
  console.log('[firebaseAdmin] Fetching artworks from database');
  const snap = await db.ref('artwall').get();
  console.log('[firebaseAdmin] Database fetch complete');
  const val = snap.val() as Record<string, Record<string, any>> | null;
  if (val) {
    const mediumKeys = Object.keys(val);
    let sampleArtworks: any[] = [];
    for (const medium of mediumKeys) {
      const group = val[medium] || {};
      for (const id of Object.keys(group)) {
        sampleArtworks.push({ id, medium, title: group[id]?.title });
        if (sampleArtworks.length >= 2) break;
      }
      if (sampleArtworks.length >= 2) break;
    }
    console.log('[firebaseAdmin] Firebase data overview:', {
      mediumCount: mediumKeys.length,
      totalArtworks: mediumKeys.reduce((sum, m) => sum + Object.keys(val[m] || {}).length, 0),
      sampleArtworks
    });
  } else {
    console.log('[firebaseAdmin] Firebase data is empty or null.');
  }
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

  console.log(`[firebaseAdmin] Returning ${items.length} artworks.`);
  return items;
}
