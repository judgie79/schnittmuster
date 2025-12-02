# 🚀 Quick Start Guide

Starte mit dem Schnittmuster Manager Backend in 5 Minuten!

## Option 1: Mit Docker (empfohlen)

### Voraussetzungen
- Docker & Docker Compose installiert

### Schritte
```bash
# 1. Repository clonen
git clone https://github.com/judgie79/schnittmuster.git
cd schnittmuster

# 2. .env Datei erstellen (optional, verwendet bereits defaults)
# cp .env.example .env

# 3. Docker Compose starten
docker-compose up --build

# 4. Fertig! 🎉
# Backend läuft auf http://localhost:5000
# PostgreSQL läuft auf localhost:5432
```

## Option 2: Lokal mit Node.js

### Voraussetzungen
- Node.js 18+ installiert
- PostgreSQL 14+ läuft lokal

### Schritte
```bash
# 1. Repository clonen
git clone https://github.com/judgie79/schnittmuster.git
cd schnittmuster

# 2. Dependencies installieren
npm install

# 3. .env Datei erstellen
cp .env.example .env
# Bearbeite .env und trage deine PostgreSQL-Zugangsdaten ein

# 4. Datenbank migrieren
npm run db:migrate

# 5. Dev Server starten
npm run dev

# 6. Fertig! 🎉
# Backend läuft auf http://localhost:5000
```

## Test die API

### 1. Register (neuer Benutzer)
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

Du erhältst einen `access_token` - kopiere diesen!

### 3. Health Check
```bash
curl http://localhost:5000/api/v1/health
```

### 4. Profile abrufen (braucht Token)
```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### 5. Schnittmuster erstellen
```bash
curl -X POST http://localhost:5000/api/v1/patterns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "Basic-Shirt von Pattydoo",
    "description": "Ein einfaches Damen-Shirt"
  }'
```

### 6. Tag-Kategorien abrufen
```bash
curl http://localhost:5000/api/v1/tags/categories
```

## 🛠️ Häufige Commands

```bash
# Dev Server mit Hot-Reload
npm run dev

# TypeScript kompilieren
npm run build

# Code formatieren
npm run format

# ESLint überprüfen und fixen
npm run lint:fix

# Tests ausführen
npm run test

# Production Build starten
npm run build && npm start
```

## 📁 Projektstruktur
```
schnittmuster/
├── src/
│   ├── config/          # Konfiguration
│   ├── types/           # TypeScript Interfaces
│   ├── middleware/      # Express Middleware
│   ├── models/          # Datenbankmodelle
│   ├── services/        # Business Logic
│   ├── controllers/     # Route Handlers
│   ├── routes/          # API Routes
│   ├── utils/           # Utilities
│   ├── migrations/      # DB Migrations
│   └── server.ts        # App Entry Point
├── docker/              # Docker Config
├── scripts/             # Helper Scripts
├── .env.example         # Env Template
└── docker-compose.yml   # Docker Compose
```

## 🔗 API Endpoints

| Method | Endpoint | Beschreibung |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Neuen Benutzer registrieren |
| POST | `/api/v1/auth/login` | Anmelden |
| GET | `/api/v1/auth/profile` | Benutzer-Profil |
| GET | `/api/v1/patterns` | Alle Schnittmuster |
| POST | `/api/v1/patterns` | Neues Schnittmuster |
| GET | `/api/v1/patterns/:id` | Einzelnes Schnittmuster |
| PUT | `/api/v1/patterns/:id` | Schnittmuster ändern |
| DELETE | `/api/v1/patterns/:id` | Schnittmuster löschen |
| POST | `/api/v1/patterns/:id/tags` | Tags hinzufügen |
| GET | `/api/v1/patterns/search` | Nach Tags suchen |
| GET | `/api/v1/tags/categories` | Tag-Kategorien |
| GET | `/api/v1/tags/categories/:id/tags` | Tags einer Kategorie |

## 🆘 Troubleshooting

### "Connection refused" Fehler
- Stelle sicher, dass PostgreSQL läuft
- Mit Docker: `docker-compose ps` - beide Services sollten "healthy" sein

### "Port 5000 bereits in Benutzung"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### TypeScript Fehler
```bash
npm install
npm run build
```

### Datenbank Problems
```bash
# Migrationen erneut ausführen
npm run db:migrate

# Mit Docker alles zurücksetzen
docker-compose down -v
docker-compose up --build
```

## 📚 Weitere Ressourcen

- [Vollständige API Dokumentation](./README.md)
- [Beitrag Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

**Viel Spaß beim Entwickeln! 🎉**
