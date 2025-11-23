# Artwall Project Architecture Guidelines

## 1. Firebase Architecture (Critical)

- **Singleton Pattern:** Always check `getApps().length` before initializing Firebase Admin. Never call `initializeApp` directly in component files.
- **Environment Variables:** Always sanitize private keys using `.replace(/\\n/g, '\n')` to handle Vercel environment differences.
- **Scope:** Never import `firebase-admin` in Client Components (`'use client'`). Use Server Actions for database mutations.

## 2. Layout & UI

- **Masonry Grid:** Use `react-responsive-masonry` for the main feed.
- **Hydration Safety:** ALWAYS wrap the Masonry component in a client-side mount check (`useEffect`) or use the `MasonryWrapper` component to prevent SSR hydration mismatches.
- **Images:** Use `next/image`. Ensure `sizes` prop is used to prevent downloading full-resolution images on mobile.

## 3. Data Fetching

- **Server Components:** Fetch data directly in `page.tsx` using `async/await` and the singleton `db` instance.
- **Caching:** Use `unstable_cache` or standard fetch caching where appropriate to reduce Firestore reads and improve speed.

## 4. Error Handling

- **Boundaries:** Ensure all route segments have an `error.tsx` to catch Firestore timeouts gracefully.
