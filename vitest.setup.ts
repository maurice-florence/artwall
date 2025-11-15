import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Provide simple mocks for Firebase modules used at module-initialization time
vi.mock('firebase/database', () => {
  return {
    getDatabase: vi.fn(() => ({})),
    ref: vi.fn(() => ({})),
    onValue: vi.fn((_ref: any, _cb: any) => {
      // return unsubscribe
      return () => {};
    }),
    remove: vi.fn(async () => {}),
    update: vi.fn(async () => {}),
    push: vi.fn(() => ({ key: 'mock-key' })),
    set: vi.fn(async () => {}),
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
}));

// mock firebase/app initializeApp so importing our client does not attempt a real init
vi.mock('firebase/app', () => ({
  initializeApp: (_config: any) => ({ /* mock app */ }),
}));

vi.mock('firebase/storage', () => ({
  getStorage: () => ({}),
  ref: () => ({})
}));

vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  // simple no-op onAuthStateChanged mock; calls callback with null (signed out)
  onAuthStateChanged: (_auth: any, cb: (user: any) => void) => {
    // call with null to represent signed-out state; return unsubscribe
    cb(null);
    return () => {};
  },
}));

// Mock next/navigation useRouter to avoid 'router not mounted' errors in tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => Promise.resolve() })
}));

declare global {
  var vi: typeof import('vitest')['vi'];
}