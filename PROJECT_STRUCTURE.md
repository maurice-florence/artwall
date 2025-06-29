# Project Structure

This project uses the Next.js App Router and React Context for all global state. Below is an overview of the main folders and conventions:

## Folders

- `src/app/` — All pages and layouts (Next.js App Router)
- `src/components/` — Reusable UI components
- `src/context/` — Context providers for global state (filters, theme, artworks)
- `src/types/` — TypeScript types for the app
- `src/constants.ts` — App-wide constants (categories, labels, etc.)
- `src/themes.ts` — Theme definitions for styled-components
- `src/firebase.ts` — Firebase config and exports
- `src/utils/` — Utility functions
- `public/` — Static assets (SVGs, images)

## Deprecated/Legacy

- `src/hooks/` — No longer used. All hooks are now managed via context. See `src/context/`.
- `src/pages/` — No longer used. Routing is handled via the App Router in `src/app/`.

## State Management

- All global state (filters, search, view options, theme, artworks) is managed via React context providers in `src/context/`.
- Components consume state via context hooks (e.g., `useFilterContext`, `useArtworks`).

## Styling

- All styling is done with styled-components.
- Themes are defined in `src/themes.ts` and provided via the `ThemeProvider` context.

## Types

- All types are defined in `src/types/` and exported for use throughout the app.

## Firebase

- Firebase is initialized in `src/firebase.ts`.
- Make sure to set up your `.env.local` with the required Firebase credentials.

---

For more details, see the main `README.md`.
