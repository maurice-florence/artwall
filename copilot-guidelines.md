# Next.js 15 Strict Guidelines

Async Request APIs:

- params and searchParams are PROMISES.
- You MUST await them in Server Components.
- They resolve to plain objects. DO NOT use .get().

Image Configuration:

- Always include BOTH firebasestorage.googleapis.com AND storage.googleapis.com in next.config.mjs.

Component Architecture:

- Use server-only for database fetching.
- Use client-only for Masonry grids