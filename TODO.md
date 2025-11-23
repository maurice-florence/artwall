
# TODO (2025-11-23 Gemini3 Architectural Remediation)

- [ ] **Migrate all Server Components to async and await params/searchParams**
  - In every `page.tsx`, `layout.tsx`, `route.ts`, and `generateMetadata`, ensure the function is `async` and all `params`/`searchParams` are awaited before use.
  - Update all destructuring to use `const { id } = await params;` pattern.

- [ ] **Wrap useSearchParams in Suspense**
  - For any Client Component using `useSearchParams` (e.g., for filtering), ensure it is wrapped in a `<Suspense>` boundary in the parent Server Component to prevent CSR bailout.

- [ ] **Refactor MasonryGrid to use next/dynamic (SSR: false)**
  - Refactor `src/components/MasonryGrid.tsx` to import `react-responsive-masonry` using `next/dynamic` with `{ ssr: false }`.
  - Remove any direct server-side rendering of the grid; server should render a skeleton or placeholder only.

- [ ] **Harden Firebase Admin Initialization**
  - In `src/lib/firebaseAdmin.ts`, sanitize the private key with `.replace(/\\n/g, '\n')` for Vercel compatibility.
  - Ensure singleton pattern: only initialize if `getApps().length === 0`.

- [ ] **Update next.config.js to use remotePatterns**
  - Remove deprecated `domains` array.
  - Add `remotePatterns` for `firebasestorage.googleapis.com` (protocol: https, pathname: /**).

- [ ] **Document and handle browser extension hydration issues**
  - Add a note in the README about possible hydration errors caused by browser extensions (e.g., Colorzilla) and how to distinguish these from real code issues.

- [ ] **Verify all code samples and patterns**
  - Ensure all code matches the patterns in the Gemini3 remediation report (async/await, Suspense, dynamic import, singleton Firebase, remotePatterns).

# TO DO

Date: 2025-11-18

- [x] Expose fadeMs in config
  - Added `fadeMs` to `SpinnerConfig` and `DEFAULT_FADE_MS` in `src/config/spinner.ts`. Updated `usePageSpinner` to use it.
- [x] Silence test warnings
  - Wrapped `render` calls in `act` in spinner tests for reliable assertions.
- [x] Add documentation snippet
  - Added a new section to `README.md` explaining the `spinnerConfig` prop and `testInstantFade` for `HomeClient`.
- [x] Validate changes
  - Ran `vitest` to confirm spinner tests pass and warnings are gone.
- [x] Commit & push
  - Committed and pushed all spinner polish improvements.

Date: 2025-11-17

- [x] Fix deployment
  - Verify Vercel build collects page data without errors (especially for /stats).
  - Ensure all client-only modules are marked with "use client" and no client APIs run in server contexts.
  - Build locally and confirm deployment turns green.

- [x] Add loading spinner to cards
  - Each ArtworkCard now displays a placeholder/skeleton while its thumbnail/image is loading.
  - No layout shift occurs once the image appears (implemented).

- [ ] Add a version on the corner with each new adjustment and push
  - Render the app version/commit tag in a corner of the UI.
  - Auto-source from package.json version or VERCEL_GIT_COMMIT_SHA.
  - Update on every deploy.

- [x] Remove date and place from content card, and add that from metadata instead
  - Remove date/place text embedded in the content body.
  - Display date/place sourced from explicit metadata fields only.

- [ ] Fix grid on mobile
  - Ensure the mobile grid has correct column count, spacing, and no overlaps.
  - Validate with existing Cypress mobile tests and add cases if needed.

Date: 2025-11-23

- [ ] Sanitize Firebase Private Key in `firebaseAdmin.ts`
  - Use `replace(/\\n/g, '\n')` on the private key for cross-platform compatibility (Vercel, .env, etc.).
  - Blocker for stable deployment.

- [ ] Singleton Pattern for Firebase Admin Initialization
  - Ensure `getApps().length > 0` check before calling `initializeApp` in `firebaseAdmin.ts` to prevent multiple initializations.

- [ ] Transpile and Patch `react-responsive-masonry` for React 19
  - Add `react-responsive-masonry` to `transpilePackages` in `next.config.mjs`.
  - If needed, use `patch-package` to override peer dependencies for React 19 compatibility.

- [ ] Hydration-Safe Masonry Grid
  - Refactor `MasonryGrid.tsx` to use a `mounted` state check (with `useEffect`) or dynamic import with `ssr: false`.
  - Ensure server renders a skeleton grid, not the actual masonry, to prevent hydration errors.

- [ ] Enable Partial Prerendering (PPR) and Suspense
  - Set `experimental_ppr = true` in `page.tsx`.
  - Wrap the grid in `<Suspense fallback={<SkeletonGrid />}>` for fast static shell and streaming.

- [ ] Optimize Image Delivery and Costs
  - Set `Cache-Control: public, max-age=31536000, immutable` on Firebase Storage uploads.
  - Consider a custom image loader that serves pre-resized thumbnails to reduce Vercel optimization costs.

- [ ] Accessibility: Masonry Grid and Infinite Scroll
  - Test and ensure DOM order matches visual order for keyboard navigation.
  - Add "Skip to Content" links for accessibility.
  - Use `aria-live="polite"` regions to announce new images loaded via infinite scroll.
