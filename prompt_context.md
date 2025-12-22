# Prompt Context

## Old Expo App (apps/expo-app)
- Expo Router app (Expo SDK ~52) using Tailwind/nativewind classes; layouts under `app/`.
- `_layout.tsx` wires React Query provider, configures storage adapter to AsyncStorage, and sets API base URL to `http://<devhost>:5001/api/v1` fallback `http://localhost:5001/api/v1` via `setApiBaseUrl` from `@schnittmuster/core`.
- Screens:
  - `index.tsx`: Login form (email/password). If authenticated, shows pattern list plus floating "add" button. Uses `useAuth` (login/logout/state), `PatternList` component, and link to `/patterns/new`.
  - `patterns/[patternId].tsx`: Pattern detail screen. Uses `usePattern` and `usePatterns().mutate.remove`. Shows thumbnail, name, status, description, tags (colored pills), open-PDF button via `resolveAssetUrl` + `Linking`, and Edit/Delete buttons when owner or admin.
  - `patterns/new.tsx`: Create pattern. Uses `usePatterns().mutate.create`. Collects name, description, thumbnail (ImagePicker), PDF file (DocumentPicker). Builds `FormData` with name/description/status=draft/isFavorite=false plus optional thumbnail/file, submits, and navigates back.
  - `patterns/[patternId]/edit.tsx`: Edit pattern. Prefills name/description from `usePattern`. Supports new thumbnail/file uploads; submits FormData via `mutate.update`; shows existing thumbnail via `resolveAssetUrl`.
- Component `components/PatternList.tsx`: Uses `usePatterns()` to list items (name/status) with links to detail.

## Shared Core Library (packages/core)
- Exposes hooks/services/utils/stores/types via `@schnittmuster/core`.
- Storage: default in-memory with `setStorageAdapter` to override (old app sets AsyncStorage). Token keys: `schnittmuster.access_token`, `schnittmuster.refresh_token`.
- API client: Axios with base URL (default `http://localhost:5001/api/v1`, settable via `setApiBaseUrl`); adds Authorization header from storage; has 401 interceptor to refresh tokens via `/auth/refresh` using stored refresh token.
- Auth service: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/profile`; persists tokens on login/signup; removes tokens on logout.
- Pattern service: list (`/patterns`, pagination/filters), get (`/patterns/:id`), create/update with FormData (upload progress optional), delete, assign/remove tags.
- Tag service: tag categories CRUD, tags CRUD/search,  base endpoints `/tags/categories`, `/tags`, `/tags/search`.
- Hooks:
  - `useAuth`: Keeps session via `getProfile`, exposes login/signup/logout mutations, `user`, `isAuthenticated`, `isLoading`, `error`.
  - `usePatterns(page?)`: React Query list; exposes `items`, `pagination`, `filters`, setters, and `mutate` helpers `create/update/remove`.
  - `usePattern(id)`: Fetch single pattern.
  - `useTags()`: Fetch tag categories.
- Stores: Zustand `authStore` (user/isAuthenticated/isLoading/error) and `patternStore` (filters for search), though filters unused in old app UI.
- Utils: `resolveAssetUrl` to convert relative file/thumbnail paths to absolute based on API base URL; constants for storage keys/timeouts.

## Shared DTOs (shared-dtos)
- `PatternDTO`: {id, name, description?, thumbnailUrl?, fileUrl?, status: draft|geplant|genaeht|getestet|archiviert, isFavorite, tags[], ownerId, createdAt, updatedAt, proposedTags?}.
- `TagDTO`: {id, name, categoryId, categoryName, colorHex?, category?}; `TagCategoryDTO` includes tags list.
- `AuthTokenDTO` holds access/refresh info; `ApiResponse<T>` shape {success, data, message?, errors?}; pagination type: {page, pageSize, totalPages, totalItems}.

## New Expo App (apps/schnittmuster)
- Fresh Expo SDK 54 + Expo Router starter with tabs (`app/(tabs)/_layout.tsx`, `index.tsx`, `modal.tsx` demo content). No `two.tsx` file.
- Current dependencies: Expo 54 stack, expo-router 6, RN 0.81, React 19.1; no `@schnittmuster/core`, axios, or React Query yet.
- Requirement: recreate old app functionality in this new project, avoid Tailwind/nativewind, keep dependencies minimal, still on Expo 54. Use shared core/DTOs where practical.

## Functional Scope to Rebuild
- Auth: email/password login (and logout) against backend; optionally signup if desired; rely on `useAuth` from core with AsyncStorage adapter and API base config.
- Patterns: list view, detail view, create, update, delete; show tags and status; open PDF via Linking using resolved asset URL; handle thumbnail rendering.
- File handling: use ImagePicker for thumbnail, DocumentPicker for PDF (as old app). Submit FormData to `/patterns` endpoints.
- Navigation: use expo-router; flows similar to old routes (`/`, `/patterns/[id]`, `/patterns/new`, `/patterns/[id]/edit`).
- UI: rewrite without Tailwind; use StyleSheet/View/Text/Pressable; show loading/error states and basic validation.

## Backend/API
- Base URL typically `http://<devhost>:5001/api/v1`; old app derives host from Expo debugger host, fallback localhost. Tokens via bearer Authorization header. Refresh endpoint `/auth/refresh` with refresh token payload.
- Downloads/uploads served relative to API base; `resolveAssetUrl` builds absolute URL.

## Dependency Notes for New App
- To reuse core: need `@schnittmuster/core` workspace, React Query 5.x, axios, zustand; also AsyncStorage, expo-image-picker, expo-document-picker, expo-constants, expo-linking. Keep styling via React Native stylesheets (no nativewind/tailwind).
- Align React version with app (19.1 vs core 19.2.1) if needed by adjusting dependency range or using workspace hoist.
