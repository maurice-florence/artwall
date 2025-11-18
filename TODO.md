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

- [ ] Fix deployment
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

- [ ] Remove date and place from content card, and add that from metadata instead
  - Remove date/place text embedded in the content body.
  - Display date/place sourced from explicit metadata fields only.

- [ ] Fix grid on mobile
  - Ensure the mobile grid has correct column count, spacing, and no overlaps.
  - Validate with existing Cypress mobile tests and add cases if needed.
