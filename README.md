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
   npm run build
   npm start
   ```

## Project Structure
See [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md) for a detailed overview of all files, folders, and conventions.

## Key Features
- Next.js App Router (`src/app/`)
- TypeScript (strict mode, path aliasing)
- Styled-components for all styling
- Firebase (Realtime Database, Auth, Storage)
- Context providers for global state
- Modern, accessible UI with reusable components
- All filters and view options in Sidebar use a local styled `<select>`
- Admin page uses `<Suspense>` for `useSearchParams` (see `/admin`)

## Conventions & Best Practices
- All new code is strictly typed
- Use context/hooks for business logic
- Avoid direct use of `window` or browser globals in server components/SSR
- See `PROJECT_STRUCTURE.md` for more

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Deploy on Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

---

For setup, development, and deployment instructions, see `PROJECT_STRUCTURE.md` and comments in the codebase.
