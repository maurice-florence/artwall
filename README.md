# Artwall

A modern, interactive timeline and archive for creative works, built with Next.js, TypeScript, Firebase, and styled-components.

---

## Purpose

**Artwall** is a personal digital archive and timeline for creative works (art, music, writing, etc.). It allows you to:

- Organize and browse your creative output by year, medium, and subtype.
- Upload, edit, and manage works with rich metadata and media.
- Filter and search by medium, subtype, year, and keywords.
- View statistics and summaries of your creative journey.
- Use a beautiful, accessible, and mobile-friendly interface.

---

## Features

- **Next.js App Router** for server-side rendering and dynamic routing.
- **TypeScript** for strict type checking and improved developer experience.
- **Styled-components** for all styling and theming.
- **Firebase** integration for Realtime Database, Authentication, and Storage.
- **Admin modal** for adding/editing/removing works (no page reloads).
- **File upload** for images, audio, video, and PDFs.
- **Filtering** by medium, subtype, and year (sidebar and header).
- **Statistics** page for quick insights.
- **Accessible, responsive UI** for all devices.
- **Dutch/English**: UI and code comments are in English, some labels in Dutch.

---

## Why Next.js?

Next.js was chosen for its powerful features:

- **Server-side rendering (SSR):** Improves performance and SEO.
- **Dynamic routing:** Allows for flexible page structures, such as `/artwork/[id]`.
- **Static site generation (SSG):** Optimizes pages that don’t change often.
- **API routes:** Simplifies backend logic directly within the project.
- **Built-in CSS and JavaScript optimization:** Ensures fast loading times.

---

## Project Structure

The project is organized as follows:

### **Folders**

- `src/app/` — All pages and layouts (Next.js App Router).
- `src/components/` — Reusable UI components (cards, modals, sidebar, header, etc.).
- `src/context/` — Context providers for global state management.
- `src/types/` — TypeScript types for the app.
- `src/constants/medium.ts` — App-wide constants (mediums, subtypes, labels).
- `src/themes.ts` — Theme definitions for styled-components.
- `src/firebase.ts` — Firebase configuration and exports.
- `public/` — Static assets (SVGs, images).

### **Key Files**

- `src/app/artwork/[id]/page.tsx` — Dynamic page for viewing individual artworks.
- `src/components/Modal.tsx` — Modal for displaying artwork details.
- `src/components/AdminModal.tsx` — Admin interface for editing and adding artworks.
- `src/firebase.ts` — Firebase initialization and service exports.
- `firebase-master-sync.py` — Script for syncing local files with Firebase.
- `evernote-to-files.py` — Script for converting Evernote `.enex` files to local `.html` files.
- `firebase-status-checker.py` — Script for checking the status of the database and storage.

---

## Firebase Integration

Firebase is used for:

- **Realtime Database:** Stores metadata and content for artworks.
- **Storage:** Hosts media files (images, audio, video, PDFs).
- **Authentication:** Manages user access.

### **Setup Requirements**

#### **1. Service Account Key**

Create a `serviceAccountKey_artwall.json` file with the following fields:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "your-private-key",
  "client_email": "your-client-email",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your-client-cert-url"
}
```

This file is required for Firebase Admin SDK to access the database and storage.

#### **2. Environment Variables**

Add Firebase credentials to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## Workflow for Updating the Database

### **Step 1: Edit Artworks in Evernote**

- Create or update artworks in Evernote.
- Ensure metadata is included in the note (e.g., title, year, category).

### **Step 2: Export to `.enex`**

- Export the updated notes from Evernote as `.enex` files.

### **Step 3: Convert `.enex` to `.html`**

- Run the `evernote-to-files.py` script to convert `.enex` files to `.html` files:

  ```bash
  python evernote-to-files.py
  ```

- This script extracts metadata and content into `.html` files.

### **Step 4: Sync with Firebase**

- Run the `firebase-master-sync.py` script to upload new or updated artworks to Firebase:

  ```bash
  python firebase-master-sync.py
  ```

- This script:
  - Reads `.html` files and media files from the local folder.
  - Updates the Firebase database and storage.

### **Step 5: Check Status**

- Run the `firebase-status-checker.py` script to verify the database and storage:

  ```bash
  python firebase-status-checker.py
  ```

- This script compares local files with Firebase to ensure everything is up to date.

---

## Getting Started

### **Install Dependencies**

```bash
npm install
```

### **Set Up Environment Variables**

- Create `.env.local` and add Firebase credentials.

### **Run the Development Server**

```bash
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) in your browser.

### **Build for Production**

```bash
npm run build && npm start
```

---

## Accessibility & Responsiveness

- All UI components are accessible and mobile-friendly.
- Features include:
  - **Keyboard Navigation:** Navigate through the app using the keyboard.
  - **ARIA Labels:** Ensure screen readers can interpret the UI correctly.
  - **Responsive Design:** Optimized for all screen sizes, from mobile to desktop.

---

## Contributing

Pull requests and suggestions are welcome! Please open an issue for major changes.

### Last updated: August 2025