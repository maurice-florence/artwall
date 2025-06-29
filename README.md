# Creatieve Tijdlijn — Next.js App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Project Structure
See [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) for a detailed overview of all files, folders, and conventions.

## Key Features
- Next.js App Router (`src/app/`)
- TypeScript (strict mode, path aliasing)
- Styled-components for all styling
- Firebase (Realtime Database, Auth, Storage)
- Context providers for global state (`FilterContext`, `ThemeContext`, `ArtworksContext`)
- Modern, accessible UI with reusable components

## State Management
- All global state (filters, search, view options, theme, artworks) is managed via React context providers in `src/context/`.
- Components consume state via context hooks (e.g., `useFilterContext`, `useArtworks`).

## Deprecated/Legacy
- `src/hooks/` and `src/pages/` are no longer used. See `src/context/` and `src/app/` for the current approach.

---

For more details, see `PROJECT_STRUCTURE.md` and code comments throughout the project.

_Laatste update: 30 juni 2025_
