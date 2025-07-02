# Creatieve Tijdlijn

A modern, interactive timeline and archive for creative works, built with Next.js, TypeScript, Firebase, and styled-components.

## Purpose

**Creatieve Tijdlijn** is a personal digital archive and timeline for creative works (art, music, writing, etc.). It allows you to:
- Organize and browse your creative output by year and category
- Upload, edit, and manage works with rich metadata and media
- Filter and search by category, year, and keywords
- View statistics and summaries of your creative journey
- Use a beautiful, accessible, and mobile-friendly interface

## Card Categories

Each card represents a creative work and belongs to one of these categories:

- **poetry**: Poems and verse
- **prosepoetry**: Prose poetry
- **prose**: Prose, stories, essays (PDF upload supported)
- **music**: Songs, compositions (audio upload, SoundCloud integration, lyrics/chords)
- **sculpture**: Sculptural works (image upload)
- **drawing**: Drawings and illustrations (image upload)
- **image**: Other images/artwork
- **video**: Video works (video upload)
- **other**: Anything else

Each category has its own icon, color, and card layout. Only categories present in your database are shown in the UI.

## Features

- **Next.js App Router** (`src/app/`)
- **TypeScript** (strict mode, path aliasing)
- **Styled-components** for all styling and theming
- **Firebase** (Realtime Database, Auth, Storage)
- **Context providers** for global state (`FilterContext`, `ThemeContext`, `ArtworksContext`)
- **Admin modal** for adding/editing/removing works (no page reloads)
- **File upload** for images, audio, video, and PDFs
- **Filtering** by category and year (sidebar and header)
- **Statistics** page for quick insights
- **Accessible, responsive UI**
- **Dutch/English**: UI and code comments are in English, some labels in Dutch

## Project Structure

See [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) for a detailed overview of all files, folders, and conventions.

- `src/app/` — All pages and layouts (Next.js App Router)
- `src/components/` — Reusable UI components (cards, modals, sidebar, header, etc.)
- `src/context/` — Context providers for global state
- `src/types/` — TypeScript types for the app
- `src/constants.ts` — App-wide constants (categories, labels, etc.)
- `src/themes.ts` — Theme definitions for styled-components
- `src/firebase.ts` — Firebase config and exports
- `public/` — Static assets (SVGs, images)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` (if present) or create `.env.local` manually.
   - Add your Firebase credentials and other secrets (see `PROJECT_STRUCTURE.md` for required keys).

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production:**
   ```bash
   npm run build && npm start
   ```

## State Management

- All global state (filters, search, view options, theme, artworks) is managed via React context providers in `src/context/`.
- Components consume state via context hooks (e.g., `useFilterContext`, `useArtworks`).

## Theming

- Multiple color themes are available (see `src/themes.ts`).
- Users can switch themes via the UI.

## Admin & Editing

- The AdminModal provides a prop-driven, reusable interface for adding and editing works.
- File uploads are supported for images, audio, video, and PDFs.
- All changes are synced live with Firebase.

## Filtering & Sidebar

- The sidebar and header allow filtering by category and year.
- Only categories present in your database are shown as filter options.

## Statistics

- The `/stats` page shows total works, counts per category, and first/last work by year.

## Accessibility & Responsiveness

- All UI components are accessible and mobile-friendly.
- Keyboard navigation and ARIA labels are provided where needed.

## Contributing

Pull requests and suggestions are welcome! Please open an issue for major changes.

---

For more details, see `PROJECT_STRUCTURE.md` and code comments throughout the project.

_Last updated: July 2025_
