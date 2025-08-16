import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const firebaseConfig = {
  apiKey: "AIzaSyD3A9bkk6BgRQCS2eEiuW6wxuUCqu5rrhA",
  authDomain: "artwall-by-jr.firebaseapp.com",
  databaseURL: "https://artwall-by-jr-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "artwall-by-jr",
  storageBucket: "artwall-by-jr.firebasestorage.app",
  messagingSenderId: "685080228794",
  appId: "1:685080228794:web:9ff03f803c2b68773ea383"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
