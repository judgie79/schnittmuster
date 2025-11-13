# schnittmuster# Schnittmuster Manager - Backend

Vollständiger TypeScript/Node.js Backend für das Tag-basierte Schnittmuster-Verwaltungssystem.

## 🚀 Features

- **Tag-basierte Organisation**: Flexible Kategorisierung von Schnittmustern
- **Benutzerautentifizierung**: JWT-basierte Authentifizierung
- **Multi-User Support**: Jeder Benutzer hat eigene Schnittmuster und Tags
- **RESTful API**: Vollständige API für Frontend-Integration
- **Docker-Unterstützung**: Self-Hosted in Docker möglich
- **PostgreSQL**: Robuste Datenbankdatenspeicherung
- **TypeScript**: Vollständige Typsicherheit

## 📋 Anforderungen

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

## 🛠️ Installation

### 1. Repository Clonen
```bash
git clone https://github.com/judgie79/schnittmuster.git
cd schnittmuster/backend
```

### 2. Abhängigkeiten Installieren
```bash
npm install
```

### 3. Umgebungsvariablen
```bash
cp .env.example .env
# Bearbeite .env mit deinen Einstellungen
```

## 🐳 Mit Docker Starten

### Docker Compose (empfohlen)
```bash
docker-compose up --build
```

Der Backend läuft dann auf `http://localhost:5000`

## 🏃 Lokal Entwickeln

### Development Server starten
```bash
npm run dev
```

Der Server läuft auf `http://localhost:5000`

### TypeScript kompilieren
```bash
npm run build
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Formatierung
```bash
npm run format
```

## 📚 API Dokumentation

### Authentifizierung

#### Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "meine_mutter",
  "email": "mutter@example.com",
  "password": "secure_password_123"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "mutter@example.com",
  "password": "secure_password_123"
}

Response:
{
  "success": true,
  "data": {
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": 1,
      "username": "meine_mutter",
      "email": "mutter@example.com",
      "created_at": "2025-11-13T..."
    }
  }
}
```

### Schnittmuster

#### Schnittmuster erstellen
```
POST /api/v1/patterns
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Basic-Shirt",
  "description": "Ein einfaches Damen-Shirt von Pattydoo"
}
```

#### Alle Schnittmuster abrufen
```
GET /api/v1/patterns?limit=50&offset=0
Authorization: Bearer {access_token}
```

#### Einzelnes Schnittmuster abrufen
```
GET /api/v1/patterns/{id}
Authorization: Bearer {access_token}
```

#### Schnittmuster aktualisieren
```
PUT /api/v1/patterns/{id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Tags zu Schnittmuster hinzufügen
```
POST /api/v1/patterns/{id}/tags
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "tag_ids": [1, 5, 10, 15, 20]
}
```

#### Nach Tags suchen
```
GET /api/v1/patterns/search?tags=1,5,10&operator=AND
Authorization: Bearer {access_token}
```

### Tags

#### Alle Tag-Kategorien abrufen
```
GET /api/v1/tags/categories
```

#### Tags einer Kategorie abrufen
```
GET /api/v1/tags/categories/{categoryId}/tags
```

#### Neue Kategorie
```
POST /api/v1/tags/categories/{categoryId}/tags
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Neue Hersteller",
  "color_hex": "#FF0000"
}
```

## 🗂️ Projektstruktur

```
src/
├── config/              # Konfiguration
│   ├── database.ts
│   └── environment.ts
├── types/               # TypeScript Interfaces
│   └── index.ts
├── middleware/          # Express Middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── models/              # Datenbankmodelle
│   ├── User.ts
│   ├── Pattern.ts
│   ├── Tag.ts
│   └── PatternTag.ts
├── services/            # Business Logic
│   ├── AuthService.ts
│   ├── UserService.ts
│   ├── PatternService.ts
│   └── TagService.ts
├── controllers/         # Route Handlers
│   ├── AuthController.ts
│   ├── PatternController.ts
│   └── TagController.ts
├── routes/              # API Routes
│   ├── auth.routes.ts
│   ├── patterns.routes.ts
│   ├── tags.routes.ts
│   └── index.ts
├── utils/               # Utilities
│   ├── errors.ts
│   ├── logger.ts
│   └── validators.ts
├── migrations/          # Datenbank Migrationen
│   └── 001_init_schema.sql
└── server.ts            # Express App Entry Point
```

## 🔒 Sicherheit

- Alle Passwörter werden mit bcryptjs gehasht
- JWT-Token für Authentifizierung (24h Gültigkeit)
- CORS-Protection
- SQL-Injection Prevention (Parametrisierte Queries)
- Rate Limiting (empfohlen: selbst implementieren)
- HTTPS (empfohlen in Production)

## 📝 Umgebungsvariablen

| Variable | Beschreibung | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server Port | 5000 |
| DB_HOST | PostgreSQL Host | localhost |
| DB_PORT | PostgreSQL Port | 5432 |
| DB_USER | Datenbankbenutzer | schnittmuster_user |
| DB_PASSWORD | Datenbankpasswort | change_me_in_production |
| DB_NAME | Datenbankname | schnittmuster_db |
| JWT_SECRET | JWT Secret Key | your-secret-key |
| JWT_EXPIRY | Token Gültigkeit | 24h |
| CORS_ORIGIN | Erlaubte CORS Origins | http://localhost:3000 |

## 🧪 Testing

```bash
npm run test              # Tests ausführen
npm run test:watch       # Tests im Watch-Mode
```

## 🚢 Production Deployment

1. Baue das Projekt:
```bash
npm run build
```

2. Starte mit Node:
```bash
NODE_ENV=production npm start
```

Oder mit Docker:
```bash
docker-compose -f docker-compose.yml up -d
```

## 📧 Support

Für Fragen oder Issues, bitte ein GitHub Issue erstellen.

## 📄 Lizenz

MIT License - Siehe LICENSE Datei

---

**Entwickelt mit ❤️ für deine Mutter!**
