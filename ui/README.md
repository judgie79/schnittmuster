# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Schnittmuster Manager – Frontend

  Mobile-first React UI für die tagbasierte Schnittmusterverwaltung. Optimiert für Touch-Geräte und nicht-technische Hobbynäher (erste Nutzerin = Entwickler-Mama 🧵).

  ## Tech Stack

  - React 18 + TypeScript 5.3
  - Vite 7
  - React Router v7
  - TanStack Query v5
  - Axios, Context + useReducer, CSS Modules (Tailwind vorbereitet)

  ## Getting Started

  ```bash
  cp .env.example .env
  npm install
  npm run dev
  # Frontend: http://localhost:5173
  # Backend:  http://localhost:5000/api/v1
  ```

  ## Scripts

  | Command | Beschreibung |
  | --- | --- |
  | `npm run dev` | Dev-Server mit HMR |
  | `npm run build` | Type-Check + Production Build |
  | `npm run preview` | Preview des Builds |
  | `npm run lint` | ESLint (Flat Config) |

  ## Projektstruktur

  ```
  src/
    assets/             # Icons, Bilder, Fonts
    components/
      layout/           # Layout, Header, BottomNav, Container
      common/           # Button, Card, Modal, Toast, Loader, Badge, Avatar
      features/         # PatternCard, PatternGrid, TagSelector, FileUpload, SearchBar, FilterPanel
    context/            # GlobalProvider + Reducer + Typed State
    hooks/              # useAuth, usePatterns, usePattern, useTags, useSearch, useLocalStorage, useInfiniteScroll
    pages/              # Screens (Auth, Dashboard, Detail, Add/Edit, Search, Settings, Profile, 404)
    router/             # Route Config + PrivateRoute Wrapper
    services/           # Axios Client + Auth/Pattern/Tag/File Services
    styles/             # Design Tokens + Global Styles (8px Grid, Touch Targets)
    types/              # DTOs, Form + API Typen
    utils/              # Constants, Formatter, Validatoren, Error Handler, Navigation
  ```

  ## Environment Variablen

  | Key | Beschreibung | Default |
  | --- | --- | --- |
  | `VITE_API_BASE_URL` | Backend API Root | `http://localhost:5000/api/v1` |
  | `VITE_APP_NAME` | App-Name | `Schnittmuster Manager` |
  | `VITE_APP_VERSION` | Versionslabel | `2.0.0` |
  | `VITE_GOOGLE_CLIENT_ID` | OAuth Client ID | _(Pflicht für Google Login)_ |

  ## UX-Leitplanken

  - Mobile-first, große Touch-Flächen (≥ 44px)
  - Max. 1–2 Hauptaktionen pro Screen
  - Klare Sprache statt Tech-Sprech
  - Sichtbare Lade-, Fehler- und Erfolgsmeldungen (Loader + Toasts)
  - Light/Dark Themes mit Teal (#32b8c6) + Warm Brown (#5e5240)
  - React Query Caching & Offline-taugliche Listen

  ## Nächste Schritte

  1. Auth- und Pattern-Formulare final mit Backend verbinden
  2. Favoriten/Status-Aktionen + Pagination/Infinite Scroll
  3. Toaster + Empty States pro Screen ausbauen
  4. Accessibility- & Performance-Polish (Focus, ARIA, Tests)

  # React + TypeScript + Vite
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
