# Project Structure and Outline: creatieve-tijdlijn (Next.js)

## Root Directory
- `README.md` — Project overview, setup, usage, and deployment instructions
- `package.json` — Project dependencies, scripts, and metadata
- `package-lock.json` — Dependency lock file for reproducible installs
- `tsconfig.json` — TypeScript configuration (with alias @ → src)
- `eslint.config.mjs` — ESLint configuration for code linting
- `next-env.d.ts` — Next.js type definitions
- `next.config.ts` — Next.js configuration
- `.gitignore` — Files/folders ignored by git (see below)
- `.env.local` — Environment variables for Firebase and other secrets (not committed)

## Public Assets
- `public/` — Static assets served at the root
  - `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — SVG assets for UI/icons

## Source Code (`src/`)
- `src/constants.ts` — App-wide constants (CATEGORIES, CATEGORY_LABELS)
- `src/GlobalStyle.ts` — Global styled-components styles
- `src/styled.d.ts` — TypeScript theme typings for styled-components
- `src/themes.ts` — Theme definitions (atelier, blueprint, dark)
- `src/firebase.ts` — Firebase initialization and exports (production)
- `src/firebase/index.ts` — Dummy Firebase exports for development/testing
- `src/utils/index.ts` — Utility functions (e.g., formatDate)
- `src/types/index.ts` — Main TypeScript types (Artwork, etc.)

### App Directory (Next.js App Router)
- `src/app/` — Main application entry (App Router)
  - `layout.tsx` — Root layout, theme provider, global styles
  - `page.tsx` — Home page (timeline)
  - `page.module.css` — Home page CSS module (legacy/global styles)
  - `favicon.ico` — Favicon
  - `admin/page.tsx` — Admin page (artwork editing/creation, wrapped in <Suspense> for useSearchParams)
  - `login/page.tsx` — Login page
  - `stats/page.tsx` — Stats page
  - `HomePage.styles.tsx` — Styled components for home page
  - `stats/StatsPage.styles.tsx` — Styled components for stats page

### Components
- `src/components/` — Reusable UI components
  - `ErrorBoundary.tsx` — React error boundary
  - `Footer.tsx` — Footer component
  - `Form.styles.tsx` — Styled components for forms
  - `Header.tsx` — Header with theme switcher
  - `Link.tsx` — Wrapper for Next.js Link
  - `Modal.tsx` — Modal dialog for artwork details
  - `ScrollToTop.tsx` — Scroll-to-top button
  - `Sidebar.tsx` — Sidebar for filters and options (uses local styled <select>)
  - `ThemeSwitcher.tsx` — Theme switcher UI
  - `TimelineYear.tsx` — Timeline year grouping
  - `types.ts` — Additional types for components
  - `ui/Button.tsx` — Styled button component

### Context Providers
- `src/context/` — React context providers for global state
  - `ArtworksContext.tsx` — Artworks data context (with loading state)
  - `FilterContext.tsx` — Filter and view options context
  - `ThemeContext.tsx` — Theme context and provider (with styled-components integration)

### Hooks
- `src/hooks/` — Custom React hooks (currently placeholders)
  - `useArtworks.ts` — (empty, placeholder; use context instead)
  - `useAuth.ts` — (empty, placeholder; use Firebase auth directly)

### Lib
- `src/lib/registry.tsx` — Styled-components SSR registry for Next.js (App Router)

### Pages (legacy, not used by Next.js app router)
- `src/pages/` — (legacy, not used; for reference/migration only)
  - `HomePage.styles.ts` — (legacy, placeholder)
  - `HomePage.ts` — (legacy, types only)

## .gitignore (files/folders ignored by git)
- `node_modules/` — Node dependencies
- `.next/` — Next.js build output
- `.env`, `.env.*` — Environment variables
- `out/` — Static export output
- `*.log` — Log files
- `*.local` — Local config files
- `coverage/` — Test coverage output
- `build/` — Build output (if any)

## Development & Build Scripts
- Common scripts in `package.json` include:
  - `dev` — Start the Next.js development server (with Turbopack)
  - `build` — Build the app for production
  - `start` — Start the production server
  - `lint` — Run ESLint on the codebase

## Conventions & Best Practices
- Use functional React components and hooks throughout.
- Keep business logic in context providers and hooks for reusability.
- Use the `@/` alias for all internal imports from `src/` (see `tsconfig.json`).
- Prefer styled-components for all styling; avoid CSS modules except for global/legacy styles.
- Keep placeholder/legacy files (e.g., `src/pages/`, empty hooks) for reference or future migration only.
- All new code should be strictly typed with TypeScript (strict mode enabled).
- Use descriptive commit messages and follow conventional commits if possible.
- Use React context for global state (artworks, filters, theme).
- Use Firebase for database, authentication, and storage (see `src/firebase.ts`).
- Wrap any use of useSearchParams in a <Suspense> boundary (see `src/app/admin/page.tsx`).
- Avoid direct use of `window` or other browser globals in server components or during SSR.

## Tooling
- ESLint is used for linting (`eslint.config.mjs`).
- Prettier is recommended for code formatting (add `.prettierrc` if not present).
- TypeScript strict mode is enabled for type safety.
- Next.js App Router is used (no `src/pages/` except legacy).
- React Hot Toast is used for notifications.
- React Icons is used for iconography.
- Styled-components is used for all component and global styling.

## Notes
- The project uses the Next.js App Router (`src/app/`).
- TypeScript is used throughout, with strict settings and path aliasing (`@/` → `src/`).
- Styling is handled with styled-components and global styles.
- Firebase is set up for database, auth, and storage (with dummy dev exports for local/testing).
- All major logic is organized in context providers, hooks, and components.
- All SVGs and static assets are in `public/`.
- All files/folders listed in `.gitignore` are not tracked by git.
- See `README.md` for setup, development, and deployment instructions.
