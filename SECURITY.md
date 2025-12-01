# Security Overview

Dieses Dokument fasst die wichtigsten Sicherheitsmaßnahmen des Schnittmuster-Backends zusammen und bietet Empfehlungen für Produktionseinsetzungen.

## 1. Authentifizierung & Autorisierung
- **JWT Access Tokens**: Signiert mit `JWT_SECRET`, Standard-Lebensdauer `15m`. Enthält `userId`, `sub` (E-Mail) und `provider`.
- **Refresh Tokens**: Signiert mit `JWT_REFRESH_SECRET`, Standard `7d`. Endpunkt `/auth/refresh` gibt neue Access Tokens aus.
- **Google OAuth2**: Optionaler Login-Fluss via Passport. Stelle sicher, dass `OAUTH_CALLBACK_URL` bei Google registriert ist und nur vertrauenswürdige Origins zugelassen sind.
- **Benutzerkontext**: Jeder Request läuft über `authenticate`-Middleware. Services prüfen Eigentum (`ownerId`) und verweigern Zugriff auf fremde Ressourcen mit `ForbiddenError`.

## 2. Passwort- & Geheimnisschutz
- Passwörter werden mit `bcryptjs` (12 Rounds) gehasht. Keine Klartextspeicherung.
- Secrets werden ausschließlich aus Umgebungsvariablen bezogen (`.env` dient nur als Beispiel). _Committe niemals produktive Secrets in das Repository._
- Für Produktionsumgebungen Secrets über Secret-Manager (AWS Secrets Manager, Vault, Doppler, etc.) injizieren.

## 3. Eingabevalidierung & Sanitizing
- **express-validator** sichert alle Payloads in den Routes ab (z. B. Name-Länge, UUID-Checks, Hex-Farbcodes).
- **DOMPurify (isomorphic-dompurify)** säubert sämtliche String-Felder global (`sanitizeMiddleware`).
- **Central Validation Handler** (`validationErrorHandler`) normalisiert Fehlerantworten.
- Zusätzliche Schema-Validierungen (z. B. DTO-Level) können pro Feature ergänzt werden.

## 4. Transport & Infrastruktur
- Aktiviere HTTPS auf allen öffentlichen Endpunkten (Terminating Proxy / Load Balancer).
- Setze `NODE_ENV=production`, damit Helmet vollständige Header sendet.
- Verwende aktuelle Node-Versionen (LTS) und patche regelmäßig über Dependabot/Snyk.

## 5. Rate Limiting & DoS-Schutz
- `apiLimiter` begrenzt standardmäßig auf 100 Requests pro 15 Minuten (konfigurierbar über ENV).
- Für öffentliche Anmeldestrecken wird `apiLimiter` zusätzlich inline angewendet.
- Ergänze auf Infrastruktur-ebene weitere Limits (CloudFront, NGINX, Cloudflare) für großflächige Mitigation.

## 6. Datei-Uploads & Storage
- Multer akzeptiert Dateien per Memory-Storage, bevor sie an die StorageFactory weitergereicht werden.
- Storage-Implementierungen löschen alte Dateien automatisch, sobald ein Pattern aktualisiert oder gelöscht wird.
- Beschränke `ALLOWED_FILE_TYPES` und `MAX_FILE_SIZE` in der Umgebungskonfiguration.
- Bei `STORAGE_TYPE=s3` sollten IAM-Policies nur minimal benötigte Rechte (`s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` auf spezifischem Bucket) erlauben.

## 7. Logging & Monitoring
- Winston Logger (`@shared/utils/logger`) schreibt strukturierte Logs (JSON-fähig).
- Fehler werden über `AppError`-Klassen zentralisiert. Nicht erkannte Fehler fallen in einen generischen 500-Handler.
- In Produktion Logs an zentrale Systeme (CloudWatch, ELK, Datadog) weiterleiten und Korrelation IDs ergänzen.

## 8. Datenbank- & Migrationssicherheit
- Sequelize nutzt parametrisierte Queries. SQL-Injection ist damit mitigiert.
- Führe Migrationen in einer Transaktion aus (CLI unterstützt dies). Bei Kollisionen Rollback durchführen und Schema prüfen.
- Überwache DB-Nutzerrechte: Service-Benutzer sollte nur CRUD + Schemaänderungen (für Migrationen) besitzen.

## 9. Abhängigkeiten & Updates
- Halte `pnpm-lock.yaml` aktuell und führe regelmäßig `pnpm audit`/`npm audit` aus.
- Verwende Dependabot/GitHub Security Alerts für automatische PRs.
- Prüfe nach Library-Updates insbesondere Passport-, JWT- und ORM-Komponenten.

## 10. Betriebs-Checkliste
-- [ ] HTTPS/TLS korrekt konfiguriert
-- [ ] Production-ENV ohne Default-Secrets
-- [ ] CORS-Origin Liste auf notwendige Hosts beschränkt
-- [ ] Rate-Limits und Firewall-Regeln aktiv
-- [ ] Backups für PostgreSQL + Datei-Storage vorhanden
-- [ ] Überwachung & Alerting eingerichtet (CPU, RAM, 5xx-Raten, DB Health)
-- [ ] Sicherheitsreview nach jeder größeren Änderung

Sicherheit ist ein kontinuierlicher Prozess – nutze dieses Dokument als Startpunkt und ergänze projektspezifische Anforderungen (z. B. DSGVO, Auftragsverarbeitung, Pen-Tests) nach Bedarf.
