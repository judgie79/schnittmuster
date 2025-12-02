src/
# Schnittmuster Manager – Backend

Eine production-grade Express/TypeScript API für ein tag-basiertes Schnittmuster-Management mit Clean Architecture, Sequelize ORM und flexibler Dateispeicherung.

## 🚀 Feature Highlights
- Mehrschichtige Architektur (DTOs, Mapper, Repositories, Services, Controller)
- JWT-Authentifizierung plus Google OAuth2 Login
- Mehrmandanten-Schutz: Benutzer sehen ausschließlich eigene Muster/Tags
- Datei-Uploads über abstrahiertes Storage (Local, S3 oder Datenbank)
- Beobachtbares Logging, zentrale Fehlerbehandlung und strukturierte AppErrors
- Sicherheitsmaßnahmen: Helmet, CORS-Whitelist, Rate Limiting, Request-Sanitizing, Input-Validierung
- Paginierte REST-API mit konsistenten DTO-Antworten

## 🧱 Tech Stack
- Node.js 18+, Express 4
- TypeScript 5, ts-node + nodemon für Dev
- Sequelize ORM (PostgreSQL)
- Passport (Local + Google strategies)
- Multer für Uploads, AWS SDK für S3
- Winston Logger, express-validator, express-rate-limit, isomorphic-dompurify

## 📋 Anforderungen
- Node.js ≥ 18
- pnpm 9 (oder npm/yarn als Alternative)
- PostgreSQL ≥ 14
- Docker & Docker Compose (optional, aber empfohlen für lokale Infrastruktur)

## ⚡ Quick Start
```bash
git clone https://github.com/judgie79/schnittmuster.git
cd schnittmuster

pnpm install          # npm install / yarn install funktioniert ebenfalls
cp .env.example .env  # Variablen anpassen

pnpm db:migrate       # Erstellt das Sequelize-Schema
pnpm dev              # Startet http://localhost:5000
```

Production-Build: `pnpm build && pnpm start`

## 🐳 Docker Compose
```bash
docker-compose up --build
```
Bereitgestellt werden API (`http://localhost:5000`) + PostgreSQL (`localhost:5432`). Anpassen der `.env` reicht für beide Modi.

## 🔧 Nützliche Skripte
| Script | Zweck |
|--------|-------|
| `pnpm dev` | Entwicklungsserver (ts-node + nodemon)
| `pnpm build` | TypeScript -> dist transpilen
| `pnpm start` | Production-Start aus `dist`
| `pnpm lint` / `pnpm lint:fix` | ESLint prüfen bzw. automatisch fixen
| `pnpm test` / `pnpm test:watch` | Jest Tests einmalig bzw. im Watch-Mode
| `pnpm db:migrate` | Sequelize Migrationen anwenden
| `pnpm db:seed` | (Optional) Seed-Skripte ausführen

## 🌱 Umgebung & Konfiguration

| Kategorie | Variable | Beschreibung | Default |
|-----------|----------|--------------|---------|
| Server | `NODE_ENV` | `development` oder `production` | `development` |
|  | `PORT` | HTTP-Port | `5000` |
|  | `API_PREFIX` | Basis aller Routen | `/api/v1` |
| Datenbank | `DB_HOST`/`DB_PORT` | PostgreSQL Host/Port | `localhost` / `5432` |
|  | `DB_USER`/`DB_PASSWORD`/`DB_NAME` | Zugangsdaten | siehe `.env.example` |
|  | `DB_POOL_MIN`/`DB_POOL_MAX` | Connection-Pool | `2` / `10` |
|  | `DB_LOGGING` | SQL-Logging aktivieren | `false` |
| Auth | `JWT_SECRET`/`JWT_EXPIRY` | Access Token Signatur & TTL | `your_jwt_secret`, `15m` |
|  | `JWT_REFRESH_SECRET`/`JWT_REFRESH_EXPIRY` | Refresh Tokens | `7d` |
|  | `OAUTH_PROVIDER` | derzeit `google` | `google` |
|  | `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` | OAuth2 Credentials | `` |
|  | `OAUTH_CALLBACK_URL` | Redirect-URL | `http://localhost:5000/api/v1/auth/google/callback` |
| Storage | `STORAGE_TYPE` | `local`, `s3` oder `database` | `local` |
|  | `UPLOAD_DIR` | Zielpfad für local/database | `./uploads` |
|  | `S3_BUCKET`/`S3_REGION` | AWS Parameter | `` / `eu-central-1` |
| Pagination | `DEFAULT_PAGE_SIZE`/`MAX_PAGE_SIZE` | Globale Grenzen | `20` / `100` |
| Security | `PASSWORD_MIN_LENGTH` | Validierung beim Registrieren | `8` |
|  | `RATE_LIMIT_WINDOW` | Millisekunden pro Quota | `900000` (15 min) |
|  | `RATE_LIMIT_MAX_REQUESTS` | Requests pro Fenster | `100` |
| CORS | `CORS_ORIGIN` | kommaseparierte Liste erlaubter Origins | `http://localhost:3000` |
| Logging | `LOG_LEVEL` | Winston Level | `debug` |

Weitere Details siehe `env.example`.

## 🗂️ Projektstruktur
```

├── config/                # Environment, DB, auth, pagination, storage configs
├── features/
│   ├── auth/              # AuthController, service, repository, routes, strategies
│   ├── patterns/          # PatternController/Service/Repository/Routes
│   └── tags/              # Tag-Funktionalität
├── infrastructure/
│   ├── database/
│   │   ├── models/        # Sequelize Modelle + Associations
│   │   ├── migrations/    # Code-basierte Migrationen
│   │   └── repositories/  # Low-level Datenzugriff
│   └── storage/           # StorageFactory + Implementierungen (Local/S3/Database)
├── middleware/            # Auth, OAuth, Error Handler, Sanitizer, Rate Limiter
├── routes/                # API Entry Points -> Feature Router
├── shared/                # DTOs, Mapper, Errors, Validators, Utils, Constants
├── types/                 # App-weite Typsammlungen
└── server.ts              # Express Bootstrap & graceful shutdown
```

## 🧮 API Überblick
| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| POST | `/auth/register` | Benutzer registrieren (JWT + Refresh Token)
| POST | `/auth/login` | Passwort-Login
| POST | `/auth/refresh` | Neues Access Token via Refresh
| GET | `/auth/google` | Startet OAuth2 Flow
| GET | `/patterns` | Auflistung mit Pagination & Filter
| GET | `/patterns/:id` | Detail inkl. Tags & File-Metadaten
| POST | `/patterns` | Neues Schnittmuster + optionaler Datei-Upload (Multer `file` Feld)
| PUT | `/patterns/:id` | Aktualisierung inkl. Austausch des Uploads
| DELETE | `/patterns/:id` | Entfernt Muster + FileStorage Eintrag
| GET | `/tags` | Alle Tags des angemeldeten Users
| POST/PUT/DELETE | `/tags` | Tag CRUD mit Farb-/Kategorieverwaltung

Alle obenliegenden Routen werden unter `API_PREFIX` registriert, also z. B. `/api/v1/patterns`.

## 📁 Weitere Dokumente
- [Quick Start](./QUICKSTART.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Security Notes](./SECURITY.md)
- [Changelog](./CHANGELOG.md)
- [Contribution Guidelines](./CONTRIBUTING.md)

## 🧪 Tests & Qualität
1. `pnpm lint` – prüft alle `.ts` Dateien
2. `pnpm test` – führt Jest-Suite aus (HTTP + Service Tests)
3. `pnpm build` – stellt sicher, dass das Projekt sauber transpiliert

## 🔐 Sicherheit (Kurzfassung)
- BCrypt für Passworthashes, JWT + refresh Tokens, optionale Google OAuth2
- Sanitizing (DOMPurify) und express-validator für jedes Request-Objekt
- Helmet + CORS + RateLimiter + zentrale Fehlerbehandlung
- StorageFactory löscht verwaiste Dateien bei Updates/Löschungen
- Siehe [SECURITY.md](./SECURITY.md) für vollständige Details

## 📜 Lizenz
MIT License – siehe [LICENSE](./LICENSE).

---
Made with ❤️ for sewing enthusiasts.
  "description": "Updated description"
