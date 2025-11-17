# TO DO

Date: 2025-11-17

- [ ] Fix deployment
  - Verify Vercel build collects page data without errors (especially for /stats).
  - Ensure all client-only modules are marked with "use client" and no client APIs run in server contexts.
  - Build locally and confirm deployment turns green.

- [ ] Add loading spinner to page to load image previews
  - Show a global lightweight spinner/skeleton while initial image previews are loading.
  - Hide spinner once the first meaningful content is visible.

- [ ] Add loading spinner to cards
  - Each ArtworkCard displays a placeholder/skeleton while its thumbnail/image is loading.
  - No layout shift once the image appears.

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
