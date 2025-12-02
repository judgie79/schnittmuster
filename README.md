# 🧵 Schnittmuster Manager

> **Eine moderne, selbstgehostete Web-Anwendung zur Verwaltung digitaler Schnittmuster mit granularem Access Control und User-Management.**

Ein Open-Source Projekt für Hobbynäher und professionelle Schneider zur zentralisierten Verwaltung von Schnittmustern mit tag-basiertem Klassifizierungssystem, benutzergesteuerten Freigaben und vollständiger Audit Trail.

**Entwickelt für meine Mutter 👩‍🦰 – Mit Fokus auf intuitive Bedienung und mobile Usability.**

---

## 🎯 Features

### ✨ Kern-Funktionalität

- **📋 Schnittmuster-Verwaltung**: Hochladen, organisieren und kategorisieren von PDF-Schnittmustern
- **🏷️ Tag-basiertes System**: 6 Kategorien (Zielgruppe, Kleidungsart, Hersteller, Lizenz, Größe, Status)
- **🔐 Zentrale Authentication & Authorization**:
  - Email/Passwort & Google OAuth2
  - JWT-basierte Authentifizierung
  - Role-Based Access Control (RBAC)
  - Granulare Permissions (Read, Write, Delete, Share)
- **👥 User-Managed Sharing**: Jeden Zugriff kontrollieren und gewähren
- **📊 Audit Trail**: Vollständiges Logging aller Aktivitäten für Compliance
- **📱 Mobile-First Design**: Optimiert für Smartphones, Tablets und Desktop
- **🌓 Dark Mode Support**: Angenehm für Nähen am Abend
- **📦 Multi-Storage Support**: Local, AWS S3 oder Datenbank-Speicherung

### 🚀 Technologie

- **Frontend**: React 18 + TypeScript, Vite, TanStack Query, React Router
- **Backend**: Node.js 20, Express.js, TypeScript, Sequelize ORM, PostgreSQL
- **Shared Types**: `@schnittmuster/shared` – Single Source of Truth für DTOs
- **Infrastructure**: Docker & Docker Compose für Self-Hosting
- **Security**: JWT, OAuth2/OpenID Connect, Rate Limiting, Input Validation, Audit Logging

---

## 📦 Projektstruktur

```
schnittmuster/
├── schnittmuster-shared/          # 📚 Shared TypeScript DTOs & Types (Single Source of Truth)
│   ├── src/
│   │   ├── dtos/                  # 27+ DTO Dateien (Auth, User, Pattern, Tag, File)
│   │   ├── types/                 # Enums, Interfaces
│   │   ├── constants/             # API Endpoints, Tag Categories
│   │   └── utils/                 # Validators, Formatters
│   └── package.json               # npm package
│
├── schnittmuster-backend/          # 🔧 Node.js/Express REST API
│   ├── src/
│   │   ├── config/                # Database, Auth, Pagination Config
│   │   ├── infrastructure/        # Sequelize Models, Repositories, Storage
│   │   ├── features/              # Auth, Patterns, Tags, Users (Controller→Service→Repo)
│   │   ├── middleware/            # JWT, OAuth, Authorization, Error Handling
│   │   ├── shared/                # Error Classes, Validators, Logger
│   │   └── routes/
│   ├── docker/                    # Docker Configuration
│   ├── README.md                  # Backend-spezifische Dokumentation
│   └── package.json
│
├── schnittmuster-frontend/         # ⚛️ React SPA
│   ├── src/
│   │   ├── pages/                 # Screen Components (Login, Dashboard, PatternDetail, etc)
│   │   ├── components/            # Reusable UI & Feature Components
│   │   ├── hooks/                 # useAuth, usePatterns, useAuthorization, etc
│   │   ├── context/               # Global State (AuthContext, GlobalContext)
│   │   ├── services/              # API Client, Auth Service, Pattern Service
│   │   ├── types/                 # TypeScript Interfaces (from @schnittmuster/shared)
│   │   ├── styles/                # Global CSS & CSS Modules
│   │   ├── router/                # React Router Configuration
│   │   └── utils/                 # Validators, Formatters, Logger
│   ├── .vscode/                   # VS Code Settings & Extensions
│   ├── README.md                  # Frontend-spezifische Dokumentation
│   └── package.json
│
└── docker-compose.yml             # 🐳 Complete Stack Orchestration

```

### Detaillierte Komponenten

- **Frontend**: [Frontend README](./ui/README.md)
- **Backend**: [Backend README](./backend/README.md)
- **Shared**: [Shared Types README](./shared-dtos/README.md)

---

## 🚀 Quick Start

### Voraussetzungen

- **Node.js**: 20.x LTS
- **Docker**: 24.x (optional, empfohlen für Production)
- **PostgreSQL**: 16.x (wird via Docker bereitgestellt)
- **Git**: Für Versionskontrolle

### Installation & Setup (Development)

#### 1️⃣ Repository klonen

```bash
git clone https://github.com/yourusername/schnittmuster.git
cd schnittmuster
```

#### 2️⃣ Shared DTO Library installieren

```bash
# In Backend
cd schnittmuster-backend
npm install ../schnittmuster-shared

# In Frontend
cd ../schnittmuster-frontend
npm install ../schnittmuster-shared
```

#### 3️⃣ Datenbank starten (Docker)

```bash
docker-compose up -d postgres

# oder komplett
docker-compose up
```

#### 4️⃣ Backend starten

```bash
cd schnittmuster-backend

# Dependencies
npm install

# Datenbank migrieren
npm run db:migrate

# Seed: Rollen & Permissions
npm run db:seed

# Dev Server
npm run dev

# Backend läuft auf: http://localhost:5000/api/v1
```

#### 5️⃣ Frontend starten

```bash
cd schnittmuster-frontend

# Dependencies
npm install

# Dev Server
npm run dev

# Frontend läuft auf: http://localhost:5173
```

#### 6️⃣ Testen

```bash
# Browser öffnen
http://localhost:5173

# Mit Test-Benutzer anmelden:
# Email: test@example.com
# Passwort: TestPassword123!

# oder: Google Login verwenden
```

---

## 🐳 Docker Deployment

### Schnelle Deployment (Alle Services)

```bash
docker-compose up --build
```

### Einzelne Services

```bash
# Nur Database
docker-compose up postgres

# Nur Backend
docker-compose up backend

# Nur Frontend
docker-compose up frontend

# Alle
docker-compose up
```

### Production Deployment

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

**URLs im Docker:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- PostgreSQL: localhost:5432
- pgAdmin (optional): http://localhost:5050

---

## 🔐 Authentifizierung & Authorization

### Authentifizierung

Das System unterstützt zwei Authentifizierungsmethoden:

#### 1. Email/Passwort (Local)
```bash
POST /api/v1/auth/register
{
  "username": "deine_mutter",
  "email": "mutter@example.com",
  "password": "SecurePassword123!"
}

POST /api/v1/auth/login
{
  "email": "mutter@example.com",
  "password": "SecurePassword123!"
}
```

#### 2. Google OAuth2
```bash
GET /api/v1/auth/google
# Browser öffnet Google Login
# Nach Autorisierung: JWT Token wird generiert
```

### Authorization & Rollen

**Rollen-Modell:**

| Rolle | Read | Write | Delete | Share |
|-------|------|-------|--------|-------|
| **Owner** | ✅ | ✅ | ✅ | ✅ |
| **Editor** | ✅ | ✅ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ |

**Permissions:**
- `pattern:read` - Schnittmuster lesen
- `pattern:write` - Schnittmuster bearbeiten
- `pattern:delete` - Schnittmuster löschen
- `pattern:share` - Zugriff verwalten
- `tag:read` - Tags lesen
- `tag:write` - Tags erstellen
- `tag:admin` - Tag-Administration

### User-Managed Sharing

Jeder User kann seine Schnittmuster teilen:

```bash
# Zugriff geben
POST /api/v1/patterns/{patternId}/access
{
  "user_id": "colleague@example.com",
  "role": "editor"  # oder "viewer"
}

# Zugriff widerrufen
DELETE /api/v1/patterns/{patternId}/access/{userId}

# Alle Zugriffe abrufen
GET /api/v1/patterns/{patternId}/access
```

---

## 📚 API Dokumentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

### Wichtigste Endpoints

#### Authentication
- `POST /auth/register` - Registrierung
- `POST /auth/login` - Login
- `POST /auth/refresh` - Token Refresh
- `GET /auth/profile` - Profil abrufen
- `GET /auth/google` - Google OAuth2

#### Schnittmuster
- `GET /patterns` - Liste (paginiert)
- `POST /patterns` - Erstellen (mit File Upload)
- `GET /patterns/{id}` - Details
- `PUT /patterns/{id}` - Aktualisieren
- `DELETE /patterns/{id}` - Löschen
- `POST /patterns/{id}/tags` - Tags zuweisen
- `POST /patterns/{id}/access` - Zugriff geben
- `DELETE /patterns/{id}/access/{userId}` - Zugriff widerrufen

#### Tags
- `GET /tags/categories` - Alle Tag-Kategorien
- `GET /tags/categories/{categoryId}/tags` - Tags einer Kategorie
- `GET /tags/search?q=query` - Tag-Suche

#### Audit & Compliance
- `GET /audit-logs` - Audit Trail abrufen

**Komplette API-Dokumentation:** Siehe [Backend README](./schnittmuster-backend/README.md)

---

## 🛠️ Konfiguration

### Environment Variables

**Backend (.env)**
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=schnittmuster_user
DB_PASSWORD=change_in_production
DB_NAME=schnittmuster_db

# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRY=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRY=7d

# OAuth2 / Google
OAUTH_PROVIDER=google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
OAUTH_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# File Storage
STORAGE_TYPE=local              # local | s3 | database
UPLOAD_DIR=./uploads            # für local
S3_BUCKET=my-bucket             # für s3
S3_REGION=eu-central-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# Security
PASSWORD_MIN_LENGTH=8
RATE_LIMIT_WINDOW=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Schnittmuster Manager
VITE_APP_VERSION=2.0.0

# OAuth
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## 🎨 UI/UX Design

### Mobile-First Approach

Die Anwendung ist primär für **Mobilgeräte optimiert** (320px - 768px), bietet aber auch ein komfortables Desktop-Erlebnis.

### Key Design Features

- **Bottom Tab Navigation**: Intuitive Navigation mit Daumen erreichbar
- **Große Touch Targets**: Mindestens 44x44px für alle Buttons
- **Lesbare Texte**: Minimum 16px für Body Text
- **Dark Mode Support**: Angenehmes Nähen am Abend
- **Loading States**: Klare Feedback bei Operationen
- **Error Handling**: Benutzerfreundliche Fehlermeldungen

### Screens

1. **Login/Signup** - Email/Passwort oder Google OAuth2
2. **Dashboard** - Pattern-Liste mit Quick Filters
3. **Pattern Detail** - Vollständige Pattern-Informationen
4. **Add/Edit Pattern** - Datei-Upload & Tag-Verwaltung
5. **Search & Filter** - Erweiterte Suche mit Multi-Select
6. **Settings** - Profil, Theme, Sprache, Logout
7. **Access Manager** - Zugriff auf Schnittmuster verwalten

---

## 🔒 Sicherheit

### Implemented Security Measures

✅ **Authentifizierung**
- JWT Token mit kurzer Lebensdauer (15 Minuten)
- Refresh Token für längere Sessions
- Google OAuth2 für sichere Externe Auth
- Passwort-Hashing mit bcryptjs

✅ **Authorization**
- Role-Based Access Control (RBAC)
- Granulare Permissions pro Resource
- Ownership Checks auf allen Endpoints
- Resource-Level Authorization

✅ **Input Security**
- Input Validation auf alle Felder
- SQL Injection Prevention (Sequelize ORM)
- XSS Prevention (DOMPurify)
- CSRF Token Protection

✅ **Netzwerk Security**
- HTTPS in Production (empfohlen)
- CORS Policy konfigurierbar
- Helmet.js für HTTP Security Headers
- Rate Limiting (100 Requests / 15 Minuten)

✅ **Audit & Compliance**
- Vollständiges Audit Logging
- Change Tracking
- User-spezifische Datenisolation
- GDPR-konform (Optional Log Anonymization)

### Best Practices

1. **Passwörter**: Mindestens 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen
2. **JWT Secrets**: Sehr sichere Zufallswerte generieren
3. **OAuth Secrets**: Niemals im Repository speichern
4. **Database Credentials**: Via Environment Variables
5. **CORS Origins**: Nur vertraute Domains

---

## 🧪 Testing

### Backend Tests

```bash
cd schnittmuster-backend

# Unit Tests
npm run test

# Integration Tests
npm run test:integration

# Coverage Report
npm run test:coverage
```

### Frontend Tests

```bash
cd schnittmuster-frontend

# Unit & Component Tests
npm run test

# E2E Tests (optional)
npm run test:e2e

# Coverage Report
npm run test:coverage
```

---

## 📖 Dokumentation

### Detaillierte Dokumentationen

- **[Frontend Dokumentation](./ui/README.md)** - React App, Components, Hooks
- **[Backend Dokumentation](./backend/README.md)** - API, Services, Database
- **[Shared Types Dokumentation](./shared-dtos/README.md)** - DTOs, Interfaces, Constants

### Architektur-Dokumentationen

- **[Backend Architecture Guide](./backend/docs/ARCHITECTURE.md)** - Layered Architecture, Patterns
- **[Authorization Guide](./backend/docs/AUTHORIZATION.md)** - RBAC, Permission Model
- **[API Reference](./backend/docs/API.md)** - Alle Endpoints mit Beispielen
- **[Security Best Practices](./backend/docs/SECURITY.md)** - Implementation Details

---

## 🤝 Beiträge & Entwicklung

### Für Entwickler

Das Projekt ist offen für Beiträge! Hier sind die wichtigsten Richtlinien:

#### Code Quality Standards

```bash
# TypeScript strict mode überall
# Alle Typen explizit (kein `any`)
# Input Validation auf allen Endpoints
# Error Handling überall
# Unit Tests für neue Features

# Linting & Formatting
npm run lint:fix
npm run format
```

#### Neuen Feature Entwickeln

1. **Feature Branch erstellen**
   ```bash
   git checkout -b feature/new-awesome-feature
   ```

2. **Shared DTOs aktualisieren** (wenn nötig)
   ```bash
   # schnittmuster-shared/src/dtos/
   # DTOs hinzufügen/aktualisieren
   npm run build
   ```

3. **Backend implementieren**
   ```bash
   # schnittmuster-backend/src/features/
   # Controller → Service → Repository
   npm run test
   ```

4. **Frontend implementieren**
   ```bash
   # schnittmuster-frontend/src/
   # Pages, Components, Hooks
   npm run test
   ```

5. **Pull Request erstellen**
   ```bash
   git push origin feature/new-awesome-feature
   # Create PR on GitHub
   ```

---

## 🚦 Entwicklungs-Workflow

### Lokale Entwicklung

```bash
# Terminal 1: Database
docker-compose up postgres

# Terminal 2: Backend
cd schnittmuster-backend
npm run dev

# Terminal 3: Frontend
cd schnittmuster-frontend
npm run dev

# Terminal 4: Shared Types (bei Änderungen)
cd schnittmuster-shared
npm run build
npm link ../schnittmuster-backend
npm link ../schnittmuster-frontend
```

### Database Verwaltung

```bash
# Migration erstellen
npm run db:create-migration name-of-migration

# Migrationen durchführen
npm run db:migrate

# Rollback
npm run db:migrate:undo

# Seed Daten
npm run db:seed

# pgAdmin öffnen (Docker)
# http://localhost:5050
```

---

## 🐛 Troubleshooting

### Häufige Probleme

**Problem: "Port 5000 already in use"**
```bash
# Port finden & killen
lsof -i :5000
kill -9 <PID>

# oder Port ändern
export PORT=5001
```

**Problem: "Cannot find module '@schnittmuster/shared'"**
```bash
# Shared neu installieren
npm install ../schnittmuster-shared

# Oder mit npm link
cd schnittmuster-shared
npm link
cd ../schnittmuster-backend
npm link @schnittmuster/shared
```

**Problem: "Database connection refused"**
```bash
# PostgreSQL prüfen
docker-compose ps
docker-compose logs postgres

# oder neu starten
docker-compose down
docker-compose up postgres
```

**Problem: "OAuth Token ungültig"**
```bash
# Google Credentials prüfen
# .env Datei überprüfen
GOOGLE_CLIENT_ID=correct_value
GOOGLE_CLIENT_SECRET=correct_value
```

---

## 📊 Performance & Skalierung

### Aktuelle Performance

- **Frontend**: Lighthouse Score 85+ (Mobile)
- **Backend**: ~100ms Median Response Time (lokal)
- **Database**: Sub-second Queries auf <1 Million Patterns

### Optimierungen für Skalierung

- **Frontend**: Code Splitting, Lazy Loading, Image Optimization
- **Backend**: Database Indexing, Query Caching, Connection Pooling
- **Infrastructure**: Horizontal Scaling mit Kubernetes möglich

### Monitoring & Logging

```bash
# Backend Logs
docker-compose logs -f backend

# Frontend Console
Browser DevTools → Console

# Database Queries
# pgAdmin http://localhost:5050
```

---

## 📝 Lizenz

MIT License - Frei verwendbar für kommerzielle und private Projekte.

Siehe [LICENSE](./LICENSE) für Details.

---

## 👥 Autoren & Contributors

- **Hauptentwickler**: Michael Richter
- **Produktmanagerin**: Meine Mutter 👩‍🦰
- **Contributors**: [Siehe CONTRIBUTORS.md](./CONTRIBUTORS.md)

---

## 🗓️ Roadmap

### v2.0 (Current) ✅
- ✅ Zentrale Authentication (JWT + OAuth2)
- ✅ Tag-basiertes Pattern-System
- ✅ Role-Based Access Control
- ✅ User-Managed Sharing
- ✅ Audit Trail & Compliance
- ✅ Mobile-First UI
- ✅ Docker Deployment

### v2.1 (Planned) 🔄
- [ ] Offline Mode (Service Worker)
- [ ] Pattern Import von Online-Katalogen
- [ ] Advanced Search (Full-Text)
- [ ] Pattern Notes & Annotations
- [ ] Batch Operations
- [ ] Export (PDF, ZIP)

### v3.0 (Future) 🚀
- [ ] Team/Group Management
- [ ] Collaboration Features (Comments, Suggestions)
- [ ] AI-Powered Tagging
- [ ] Pattern Recommendations
- [ ] Mobile Apps (iOS, Android)
- [ ] Real-Time Sync

---

## 📞 Support & Community

### Hilfe erhalten

- **Bugs melden**: [GitHub Issues](https://github.com/yourusername/schnittmuster/issues)
- **Fragen stellen**: [GitHub Discussions](https://github.com/yourusername/schnittmuster/discussions)
- **Email**: support@schnittmuster.local

### Community

- **GitHub**: https://github.com/yourusername/schnittmuster
- **Discord** (optional): [Community Server]()
- **Twitter** (optional): [@schnittmuster]()

---

## 💡 Fun Facts

👵 **Das Projekt wurde entwickelt, um meine Mutter bei der Verwaltung ihrer Schnittmuster-Sammlung zu helfen!**

🧵 Mit diesem System kann sie:
- Ihre 1000+ Schnittmuster zentral organisieren
- Schnittmuster mit Familie & Freunden teilen (mit Zugriffskontrolle)
- Schnell nach "Damen-Shirts von Pattydoo" suchen
- Nachverfolgung: Welche Schnittmuster sie bereits genäht hat
- Ihre Sammlung von überall (Desktop, Tablet, Handy) verwalten

---

## 📄 Weitere Ressourcen

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Changelog](./CHANGELOG.md)
- [Security Policy](./SECURITY.md)

---

**Happy Sewing! 🧵✨**

*Schnittmuster Manager - Die moderne Lösung für Schnittmuster-Organisation*