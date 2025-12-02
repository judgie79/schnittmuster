# Migration Guide

Dieses Dokument hilft dir beim Umstieg von der ursprünglichen Express/pg-Implementierung auf die neue production-grade Architektur mit Sequelize, Feature-Modulen und Storage-Abstraktion.

## 1. Überblick über Breaking Changes

| Bereich | Änderung | Auswirkungen |
|---------|----------|--------------|
| Projektstruktur | Services/Controller wurden in Feature-Module (`src/features/**`) verschoben, Shared-Layer (`src/shared`) hinzugefügt | Alte Import-Pfade (`../services/*`) sind ungültig – ersetze durch `@features/...` oder neue DTO/Mappers |
| Datenbank | Sequelize-Modelle & Migrationen (`src/infrastructure/database`) ersetzen handgeschriebene SQL-Queries | Führe die neue Migration aus, bevor die App startet. Alte Tabellen werden migriert/erweitert (z. B. `file_storage`, `pattern_notes`, `tag_categories`). |
| Auth | JWT-Handling + Refresh Tokens + Passport-basierte Strategien | Clients müssen Refresh-Flow nutzen. Token Payload enthält `userId`, `provider`. |
| API | DTOs liefern vereinheitlichte Felder (`tagIds` statt `tag_ids`, `file` Objekt mit `id`, `mimeType`, `size`) | Passe Frontend und API-Clients auf die neuen Payloads/Statuscodes an. |
| Storage | Uploads laufen über `StorageFactory` (Local/S3/Database). Dateien können beim Update/Löschen automatisch entfernt werden | Setze `STORAGE_TYPE` und ggf. S3-Credentials. Lokale Uploads landen unter `UPLOAD_DIR`. |
| Security | Request-Sanitizing, Rate-Limit und strengere Validation sind standardmäßig aktiv | Fehlende oder ungültige Felder führen zu `400 ValidationError`. Achte auf korrekte Header (`Bearer <token>`). |

## 2. Vorbereitung

1. **Dependencies installieren**
   ```bash
   pnpm install   # oder npm install
   ```
   Der neue Code benötigt zusätzliche Pakete (Passport, AWS SDK, Sequelize 6, Winston, DOMPurify, usw.).

2. **Umgebungsvariablen erweitern**
   - Kopiere `env.example` und ergänze neue Schlüssel wie `STORAGE_TYPE`, `GOOGLE_CLIENT_ID`, `DEFAULT_PAGE_SIZE`, `RATE_LIMIT_WINDOW` usw.
   - Stelle sicher, dass `API_PREFIX` korrekt gesetzt ist (Standard: `/api/v1`).

3. **Alias-Pfade konfigurieren**
   - Das aktualisierte `tsconfig.json` enthält Pfade wie `@features/*`. Falls andere Tools (Jest, ESLint) eigene Configs haben, verweise dort ebenfalls auf die neuen Aliase.

## 3. Datenbank migrieren

Die neue Initialmigration (`src/infrastructure/database/migrations/001-initial-schema.ts`) erstellt/aktualisiert folgende Tabellen:
- `users`, `patterns`, `tags`, `pattern_tags`
- `pattern_notes` (Notizen pro Schnittmuster)
- `file_storage` (Metadaten & Binary Storage, je nach Modus)
- `tag_categories`

Führe Migrationen via Sequelize CLI oder Script aus:
```bash
pnpm db:migrate
```

### Bestehende Daten übernehmen
1. **Backup** deiner aktuellen DB erstellen (`pg_dump`).
2. **Migration ausführen** – bestehende Tabellen werden bei Namensgleichheit angepasst.
3. **Altdaten einspielen**:
   - Falls du zusätzliche Spalten hattest, migriere sie in die neuen Tabellen und passe Mapper an.
   - Populate `tag_categories` und weise jedem Tag `tagCategoryId` zu (nullable erlaubt).
   - Überführe vorhandene Dateipfade in `file_storage`:
     ```sql
     INSERT INTO file_storage (id, owner_id, provider, mime_type, size, path)
     SELECT gen_random_uuid(), user_id, 'local', mime_type, size, path
     FROM legacy_files;
     ```
   - Verbinde `patterns.fileStorageId` mit dem neuen Datensatz.

## 4. Storage-Konfiguration

| STORAGE_TYPE | Verhalten |
|--------------|-----------|
| `local` | Dateien werden auf dem lokalen Dateisystem unter `UPLOAD_DIR` abgelegt. Metadaten in `file_storage`. |
| `s3` | Upload über AWS SDK. Benötigt `S3_BUCKET`, `S3_REGION` und valide AWS Credentials (ENV oder IAM Role). |
| `database` | Binärdaten werden Base64-kodiert im `file_storage` Datensatz gespeichert (für kleine Attachments). |

> **Tipp:** Wenn du von einem alten lokalen Upload-Verzeichnis kommst, verschiebe die Dateien in das neue `UPLOAD_DIR` und gleiche die Dateinamen mit den Einträgen in `file_storage` ab.

## 5. API-Anpassungen

- **Pattern Payloads**
  - Request: `tagIds` (CamelCase) – erlaubt einzelne Werte, Arrays oder JSON als String.
  - Response: Enthält `tags: TagDTO[]` und `file?: FileStorageDTO`.
- **Paginierung**: Alle `GET /patterns` Antworten liefern `{ data, pagination }` mit `page`, `pageSize`, `total`.
- **Fehlerformat**: 
  ```json
  {
    "success": false,
    "message": "Fehlerbeschreibung",
    "code": "VALIDATION_ERROR",
    "details": { ... }
  }
  ```
- **Authentifizierung**: Jede geschützte Route erwartet ein Bearer-Token. Refresh Tokens werden über `/auth/refresh` erneuert.
- **OAuth**: Neue Endpunkte `/auth/google` und `/auth/google/callback`. Stelle sicher, dass die Redirect-URL bei Google Console registriert ist.

## 6. Clients & Integrationen aktualisieren

1. **Frontend/API-Clients**
   - Aktualisiere Service-Layer auf `tagIds` und neue DTO-Struktur.
   - Passe Error-Handling an (AppError-Schema).
   - Nutze Refresh-Flow, um Access-Token automatisch zu erneuern.

2. **Automatisierte Tests**
   - Tests, die direkt Repositories oder alte Services importieren, müssen auf die neuen Klassen im Feature-Layer oder auf die öffentlichen Routes wechseln.
   - Verwende die Factories aus `src/shared/dtos` fürs Stubbing.

## 7. Validierung & Sicherheit prüfen

- Request-Sanitizing & express-validator laufen jetzt global. Entferne doppelte Sanitizing-Logik aus Custom Middleware.
- Rate Limiter (pro IP) ist aktiv: manche lokale Skripte müssen bei Massentests `RATE_LIMIT_MAX_REQUESTS` erhöhen.
- Logging läuft über Winston (`@shared/utils/logger`). Stelle sicher, dass deine Deployments den Log-Level korrekt setzen.

## 8. Abschluss-Checkliste

- [ ] `.env` aktualisiert und Secrets sicher hinterlegt
- [ ] `pnpm db:migrate` erfolgreich ausgeführt
- [ ] File-Uploads migriert und `STORAGE_TYPE` verifiziert
- [ ] Smoke-Tests für Auth, Pattern CRUD, Tag CRUD und File-Upload bestanden
- [ ] Dokumentation (README, SECURITY) gelesen und ggf. projektspezifische Ergänzungen vorgenommen

Bei Fragen oder Sonderfällen melde dich im Issue-Tracker oder öffne eine Diskussion – viel Erfolg beim Upgrade! 🚀
