# Schema Synchronization for Mobile App

This directory contains utilities for keeping the mobile app's SQLite schema in sync with the backend's PostgreSQL schema.

## Overview

The backend uses Sequelize ORM with PostgreSQL as the source of truth. The mobile app needs a local SQLite database for offline functionality. These scripts automatically extract the schema from Sequelize models to generate SQLite-compatible schemas.

## Scripts

### 1. `generate-sqlite-schema.ts`
Generates a complete SQLite schema (`.sql` file) from Sequelize models.

**Usage:**
```bash
cd backend
yarn schema:generate
```

**Output:** `backend/docs/mobile-schema.sql`

This SQL file contains:
- CREATE TABLE statements for all entities (patterns, tags, measurements, etc.)
- Sync-specific columns (syncStatus, localUpdatedAt, isDeleted)
- Junction tables for many-to-many relationships
- Sync infrastructure tables (sync_queue, file_storage_cache)
- Performance indices

### 2. `export-schema-json.ts`
Exports the schema as structured JSON for programmatic consumption.

**Usage:**
```bash
cd backend
yarn schema:export
```

**Output:** `backend/docs/mobile-schema.json`

This JSON file contains:
- Complete field definitions with types and constraints
- Enum values for fields with restricted values
- Validation rules
- Relationship information

## Integration with Mobile App

### Option A: Static Schema (Recommended for MVP)
1. Run `yarn schema:generate` in backend
2. Copy generated `mobile-schema.sql` to mobile app
3. Mobile app executes SQL on first run

```typescript
// In mobile app: packages/core/src/database/init.ts
import * as SQLite from 'expo-sqlite';
import { mobileSchema } from './schema.sql';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('schnittmuster.db');
  await db.execAsync(mobileSchema);
  return db;
};
```

### Option B: Dynamic Schema (Better for Long-term)
1. Backend serves schema via API endpoint
2. Mobile app fetches and caches schema
3. Auto-migration on schema version changes

```typescript
// Backend: Add endpoint to serve schema
router.get('/api/schema/mobile', (req, res) => {
  const exporter = new SchemaExporter();
  res.json(exporter.exportSchema());
});

// Mobile app: Fetch and apply schema
const response = await fetch('/api/schema/mobile');
const schema = await response.json();
await applySchemaToSQLite(db, schema);
```

## Schema Versioning

The exported JSON includes a version field. Increment this when making breaking changes:

1. Update models in `backend/src/infrastructure/database/models/`
2. Run `yarn schema:export`
3. Check version in generated JSON
4. Mobile app compares local vs remote version
5. Run migrations if versions differ

## Sync Columns

All tables include these columns for offline sync:

- `syncStatus`: 'pending' | 'synced' | 'conflict'
- `localUpdatedAt`: Timestamp of last local modification
- `syncedAt`: Timestamp of last successful sync
- `isDeleted`: Soft delete flag (0 = active, 1 = deleted)

## Type Mapping

| Sequelize Type | SQLite Type | Notes |
|----------------|-------------|-------|
| UUID | TEXT | Stored as string |
| STRING | TEXT | |
| TEXT | TEXT | |
| INTEGER | INTEGER | |
| BOOLEAN | INTEGER | 0 = false, 1 = true |
| DECIMAL | REAL | |
| DATE | TEXT | ISO 8601 format |
| ENUM | TEXT | Values validated in app |
| JSON | TEXT | JSON.stringify/parse |

## Maintenance

Run these scripts:
- **After adding new models:** To include them in mobile schema
- **After modifying model fields:** To keep types in sync
- **Before mobile releases:** To ensure schema compatibility

## Future Enhancements

1. **Schema Migrations**: Track changes between versions and generate ALTER TABLE statements
2. **Validation**: Compare running database schema vs generated schema to detect drift
3. **Documentation**: Auto-generate ER diagrams from schema
4. **Type Generation**: Generate TypeScript types for mobile app from schema

## Example Workflow

```bash
# 1. Developer adds new field to Pattern model
vim backend/src/infrastructure/database/models/Pattern.ts

# 2. Generate updated schema
cd backend
yarn schema:generate
yarn schema:export

# 3. Commit generated files
git add docs/mobile-schema.sql docs/mobile-schema.json
git commit -m "Update mobile schema for new Pattern fields"

# 4. Mobile app pulls changes and updates database
# (automatically on next sync or app update)
```
