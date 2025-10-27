# Artwall

A modern, interactive timeline and archive for creative works, built with Next.js 15, TypeScript, Firebase, and styled-components.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10-orange.svg)](https://firebase.google.com/)

---

## 📖 Overview

**Artwall** is a personal digital archive and interactive timeline for creative works across multiple mediums (writing, drawing, audio, sculpture, and more). It provides a rich, filterable interface to organize, browse, and manage your creative output over time.

### Key Capabilities

- 📅 **Timeline View**: Browse works chronologically by year
- 🎨 **Multi-Medium Support**: Writing, drawing, audio, sculpture, and custom categories
- 🔍 **Advanced Filtering**: Filter by medium, subtype, year, evaluation, and rating
- 🎯 **Smart Forms**: Intelligent form validation with context-aware suggestions
- 🌍 **Multi-Language**: Support for multiple language translations per artwork
- 📊 **Statistics Dashboard**: Insights into your creative productivity
- 🎨 **Custom Theming**: Save and switch between custom color themes
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile

---

## ✨ Features

### Core Functionality

- **Next.js 15 App Router** with server-side rendering and dynamic routing
- **TypeScript** with strict type checking for enhanced developer experience
- **Firebase Integration**:
  - Realtime Database for artwork metadata
  - Cloud Storage for media files (images, audio, video, PDFs)
  - Authentication for secure access
- **Styled-components** for component-scoped styling and theming
- **Context API** for global state management (artworks, filters, themes)

### UI Components

- **AdminModal**: Full-featured CRUD interface for managing artworks
- **Smart Form System**: Context-aware validation with real-time feedback
- **Modal Viewer**: Rich artwork detail view with media playback
- **Filterable Header**: Quick access to medium, evaluation, and rating filters
- **Sidebar**: Year-based timeline navigation
- **Theme Editor**: Customize and save color schemes
- **Responsive Cards**: Adaptive card layouts for different mediums

### Media Support

- **Images**: Upload and display artwork images
- **Audio**: Waveform visualization using Wavesurfer.js
- **Writing**: Markdown rendering with React Markdown
- **Video**: Embedded video player support
- **PDFs**: Document viewer integration

### Developer Experience

- **Vitest** for unit and integration testing
- **Cypress** for end-to-end testing
- **ESLint** for code quality
- **TypeScript** path aliases (`@/*`) for clean imports
- **Hot Module Replacement** for instant feedback during development

---

## 🏗️ Architecture

### Project Structure

```text
artwall/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Homepage with artwork grid
│   │   ├── artwork/[id]/       # Dynamic artwork detail pages
│   │   ├── admin/              # Admin dashboard
│   │   └── stats/              # Statistics page
│   ├── components/             # Reusable UI components
│   │   ├── AdminModal/         # Admin CRUD interface
│   │   ├── NewEntryModal/      # Quick-add modal
│   │   ├── ErrorBoundary/      # Error handling wrapper
│   │   ├── Header.tsx          # Main navigation with filters
│   │   ├── Sidebar.tsx         # Year-based timeline
│   │   ├── Footer.tsx          # Footer component
│   │   ├── Modal.tsx           # Artwork detail viewer
│   │   ├── ArtworkCard.tsx     # Grid card component
│   │   ├── ThemeEditor.tsx     # Theme customization UI
│   │   └── common.ts           # Shared styled components
│   ├── context/                # React Context providers
│   │   ├── ArtworksContext.tsx # Artwork data management
│   │   ├── FilterContext.tsx   # Filter state management
│   │   └── ThemeContext.tsx    # Theme state management
│   ├── hooks/                  # Custom React hooks
│   │   └── useDropdown.ts      # Reusable dropdown logic
│   ├── constants/              # App-wide constants
│   │   ├── medium.ts           # Medium definitions
│   │   ├── medium-subtypes.json # Subtype mappings
│   │   └── validation.ts       # Validation rules
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts            # Core type definitions
│   ├── utils/                  # Utility functions
│   │   ├── validation.ts       # Form validation helpers
│   │   ├── image-urls.ts       # Image URL utilities
│   │   └── firebase-operations.ts # Firebase helpers
│   ├── firebase/               # Firebase configuration
│   │   ├── client.ts           # Client SDK initialization
│   │   └── index.ts            # Exports
│   ├── themes.ts               # Theme definitions
│   ├── GlobalStyle.ts          # Global CSS styles
│   └── styled.d.ts             # Styled-components types
├── cypress/                    # E2E tests
│   └── e2e/                    # Test specifications
├── public/                     # Static assets
├── firebase-master-sync.py     # Database sync script
├── evernote-to-files.py        # Evernote import script
├── firebase-status-checker.py  # Database status checker
├── vitest.config.ts            # Vitest configuration
├── cypress.config.js           # Cypress configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

### Data Flow

1. **Firebase Realtime Database** stores artwork metadata
2. **ArtworksContext** fetches and normalizes data on mount
3. **FilterContext** manages active filters (medium, year, evaluation, rating)
4. **Components** consume context and render filtered results
5. **AdminModal** handles CRUD operations and syncs with Firebase

---

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Firebase** project with Realtime Database and Storage enabled
- **Python** 3.8+ (for database sync scripts)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/maurice-florence/artwall.git
cd artwall
```

1. **Install Node.js dependencies**

```bash
npm install
```

1. **Install Python dependencies** (optional, for sync scripts)

```bash
pip install -r requirements.txt
```

1. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your-database-url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

1. **Set up Firebase Admin SDK** (for sync scripts)

Create `serviceAccountKey_artwall.json` in the root directory with your Firebase Admin SDK credentials:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your-cert-url"
}
```

1. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Testing

### Unit & Integration Tests (Vitest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### End-to-End Tests (Cypress)

```bash
# Open Cypress UI
npx cypress open

# Run headless
npx cypress run
```

### Type Checking

```bash
npm run type-check
```

---

## 🎨 Features Deep Dive

### Filtering System

The app provides multiple filtering mechanisms:

1. **Medium Filter** (Header)
   - Filter by creative medium (writing, drawing, audio, sculpture, other)
   - Click icons to toggle filters
   - "All" button to clear filters

2. **Evaluation Filter** (Header)
   - Filter by personal assessment (1-5 seals)
   - Shows count of artworks matching each threshold
   - Certificate icon indicates evaluation filter

3. **Rating Filter** (Header)
   - Filter by public/audience rating (1-5 stars)
   - Shows count of artworks matching each threshold
   - Star icon indicates rating filter

4. **Year Filter** (Sidebar)
   - Browse artworks by creation year
   - Visual timeline with year markers
   - Scroll to specific years

5. **Search** (Header)
   - Real-time text search across titles and descriptions
   - Debounced for performance

### Theme System

Users can customize the visual appearance:

- **Preset Palettes**: 8 curated color schemes (Teal, Coral, Indigo, Olive, Rose, Amber, Slate, Purple)
- **Custom Colors**: Advanced mode allows precise color picking for:
  - Primary color
  - Complementary color
  - Secondary color
  - Background color
- **Save as Default**: Persist theme preferences to localStorage
- **Reset**: Restore default theme

### Smart Form System (AdminModal)

The admin form includes intelligent validation and suggestions:

- **Progress Tracking**: Visual indicator showing completion percentage
- **Field Validation**: Real-time validation with error/warning messages
- **Smart Suggestions**: Context-aware hints for next fields to fill
- **Error Summary**: Consolidated error count with visual indicators
- **Auto-save**: Draft saving to prevent data loss

### Media Handling

Different mediums have specialized rendering:

- **Writing**:
  - Full-width cards for prose/poetry
  - Markdown rendering
  - Text preview with "Read more"
- **Drawing**:
  - Image display with lightbox
  - Responsive image sizing
- **Audio**:
  - Waveform visualization
  - Play/pause controls
  - SoundCloud embedding support
- **Sculpture/Other**:
  - Image galleries
  - External URL linking

---

## 🔧 Configuration

### Firebase Rules

Ensure your Firebase Realtime Database rules allow read/write access:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

For Storage, set appropriate CORS rules using `cors.json`:

```json
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

Apply with:

```bash
gsutil cors set cors.json gs://your-bucket-name.appspot.com
```

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Vitest also uses these aliases (configured in `vitest.config.ts`).

---

## 🐍 Python Scripts

### Database Sync Workflow

The project includes Python scripts for managing data import and synchronization:

#### 1. `evernote-to-files.py`

Converts Evernote `.enex` export files to individual HTML files:

```bash
python evernote-to-files.py
```

- Extracts notes from `.enex` files
- Creates HTML files with metadata
- Preserves images and attachments

#### 2. `firebase-master-sync.py`

Syncs local HTML files and media to Firebase:

```bash
python firebase-master-sync.py
```

Features:

- Reads HTML files and extracts metadata
- Uploads media files to Firebase Storage
- Creates/updates Realtime Database entries
- Handles medium-subtype mapping
- Validates data before upload
- Progress tracking and error reporting

Configuration:

- `SOURCE_MEDIA_FOLDER`: Path to local media files
- `SERVICE_ACCOUNT_KEY_PATH`: Path to Firebase Admin SDK key
- `DATABASE_URL`: Firebase Realtime Database URL
- `STORAGE_BUCKET`: Firebase Storage bucket name

#### 3. `firebase-status-checker.py`

Verifies database and storage integrity:

```bash
python firebase-status-checker.py
```

- Compares local files with Firebase data
- Identifies missing or outdated entries
- Reports storage usage statistics
- Validates data consistency

---

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

## Testing

The project uses **Vitest** for unit and integration testing and **Cypress** for end-to-end testing.

- **Run unit tests:** `npm test`
- **Run tests in watch mode:** `npm run test:watch`
- **View test coverage:** `npm run test:coverage`
- **Run Cypress tests:** `npx cypress open` (or `npm run cypress:open` if you add it to scripts)

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

---

## 📊 Data Model

### Artwork Schema

Each artwork in the database contains:

```typescript
{
  id: string;                    // Unique identifier
  title: string;                 // Artwork title
  year: number;                  // Creation year
  month: number;                 // Creation month
  day: number;                   // Creation day
  description: string;           // Artwork description
  medium: ArtworkMedium;         // Primary medium (writing, drawing, audio, sculpture, other)
  subtype: ArtworkSubtype;       // Specific subtype (e.g., poem, song, painting)
  content?: string;              // Full content (for writing)
  isHidden?: boolean;            // Visibility flag
  
  // Multi-language support
  language1: string;             // Primary language code
  language2?: string;            // Secondary language code
  translations: {                // Translated versions
    [languageCode: string]: {
      title: string;
      description: string;
      content?: string;
    }
  };
  
  // Assessment
  evaluation?: string;           // Personal assessment (1-5)
  rating?: string;               // Public/audience rating (1-5)
  evaluationNum?: number;        // Normalized evaluation
  ratingNum?: number;            // Normalized rating
  
  // Organization
  tags?: string[];               // Categorization tags
  version?: string;              // Version number
  location1?: string;            // Physical location
  location2?: string;            // Digital location
  
  // URLs
  url1?: string;                 // Primary URL
  url2?: string;                 // Secondary URL
  url3?: string;                 // Tertiary URL
  
  // Medium-specific fields
  // (varies by medium type - see medium-subtypes.json)
}
```

### Medium Types

- **writing**: Poetry, prose, novels, essays
- **drawing**: Paintings, sketches, digital art, comics
- **audio**: Songs, compositions, soundscapes
- **sculpture**: Sculptures, installations
- **other**: Mixed media, photography, video

---

## 🎯 Component Architecture

### Shared Components (`src/components/common.ts`)

- **BaseIconButton**: Reusable icon button with consistent styling
- **Dropdown**: Animated dropdown container with fade-in/out

### Custom Hooks (`src/hooks/`)

- **useDropdown**: Manages dropdown state with click-outside detection

### Context Providers

1. **ArtworksContext**
   - Fetches artworks from Firebase
   - Normalizes evaluation/rating fields
   - Provides artworks array to all components

2. **FilterContext**
   - Manages active filters (medium, year, evaluation, rating, search)
   - Computes filtered artwork list
   - Persists filter state

3. **ThemeContext**
   - Manages current theme
   - Provides theme switching functionality
   - Persists theme to localStorage

---

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env.local` or service account keys
- **Firebase Rules**: Configure appropriate read/write permissions
- **Authentication**: Implement Firebase Auth for production deployments
- **Input Validation**: All form inputs are validated client and server-side
- **CORS**: Configure Storage CORS rules for secure media access

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
vercel --prod
```

### Other Platforms

The app can be deployed to any platform supporting Next.js 15:

- **Netlify**: Configure build command `npm run build`
- **AWS Amplify**: Use Next.js preset
- **Docker**: Create Dockerfile with Node.js 20

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Firebase connection errors

- **Solution**: Verify `.env.local` contains correct credentials
- Check Firebase project is active and billing is enabled

**Issue**: Images not loading

- **Solution**: Verify CORS rules are set on Storage bucket
- Check image URLs are properly formatted

**Issue**: Tests failing

- **Solution**: Run `npm install` to ensure all dev dependencies are installed
- Check `vitest.config.ts` has correct path aliases

**Issue**: Build errors

- **Solution**: Run `npm run type-check` to identify TypeScript errors
- Clear `.next` folder and rebuild

---

## 📝 Development Guidelines

### Code Style

- Use **TypeScript** for all new files
- Follow **ESLint** rules (run `npm run lint`)
- Use **styled-components** for styling (no CSS modules)
- Prefer **functional components** with hooks
- Write **tests** for new features

### Git Workflow

1. Create feature branch: `git checkout -b feat/feature-name`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push origin feat/feature-name`
4. Merge after review

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build/tooling changes

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [styled-components Documentation](https://styled-components.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

Please ensure:

- Code follows existing style guidelines
- Tests pass (`npm test`)
- TypeScript compiles without errors (`npm run type-check`)
- Documentation is updated as needed

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👤 Author

Maurice Florence

- GitHub: [@maurice-florence](https://github.com/maurice-florence)
- Repository: [artwall](https://github.com/maurice-florence/artwall)

---

## 🙏 Acknowledgments

- **Next.js** team for the excellent framework
- **Firebase** for backend infrastructure
- **Vercel** for hosting and deployment
- **Open source community** for amazing tools and libraries

---

**Last updated:** October 2025
