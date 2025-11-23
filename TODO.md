
# TODO list for Artwall app

## TODO (2025-11-23 Gemini3 Architectural Remediation)

- [x] **Migrate all Server Components to async and await params/searchParams**
  - Done: All relevant files now use async/await for params/searchParams as required by Next.js 15.

- [x] **Wrap useSearchParams in Suspense**
  - Done: No direct useSearchParams found; all server components using searchParams are wrapped in Suspense where needed.

- [x] **Refactor MasonryGrid to use next/dynamic (SSR: false)**
  - Done: MasonryGrid now uses next/dynamic with SSR disabled; server renders skeleton only.

- [x] **Harden Firebase Admin Initialization**
  - Done: Private key is sanitized and singleton pattern enforced in firebaseAdmin.ts.

- [x] **Update next.config.js to use remotePatterns**
  - Done: Only remotePatterns are used for images; domains array removed.

- [x] **Document and handle browser extension hydration issues**
  - Done: README documents hydration issues from browser extensions and debugging steps.

- [x] **Verify all code samples and patterns**
  - Done: All code matches Gemini3 remediation patterns and requirements.

## General TODOs

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
