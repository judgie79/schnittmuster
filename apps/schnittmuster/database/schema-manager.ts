/**
 * SQLite Schema Applier for Mobile App
 * 
 * This utility applies the backend-generated schema to the mobile SQLite database.
 * It supports both static (bundled SQL) and dynamic (API-fetched JSON) schema loading.
 */

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCHEMA_VERSION_KEY = '@schema_version';
const DB_NAME = 'schnittmuster.db';

interface SchemaVersion {
  version: string;
  appliedAt: string;
}

export class SchemaManager {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize database with schema
   * Checks version and applies migrations if needed
   */
  async initDatabase(): Promise<SQLite.SQLiteDatabase> {
    this.db = await SQLite.openDatabaseAsync(DB_NAME);
    
    const currentVersion = await this.getCurrentSchemaVersion();
    const requiredVersion = await this.getRequiredSchemaVersion();
    
    if (!currentVersion || currentVersion !== requiredVersion) {
      console.log(`Schema update required: ${currentVersion || 'none'} → ${requiredVersion}`);
      await this.applySchema();
      await this.saveSchemaVersion(requiredVersion);
    } else {
      console.log(`Schema up to date: ${currentVersion}`);
    }
    
    return this.db;
  }

  /**
   * Apply the complete schema to the database
   * This includes all tables, indices, and sync infrastructure
   */
  private async applySchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Option A: Use bundled SQL file (recommended for MVP)
    const schema = await this.getStaticSchema();
    await this.db.execAsync(schema);

    // Option B: Fetch from API (for production with auto-updates)
    // const schema = await this.fetchSchemaFromAPI();
    // await this.applySchemaFromJSON(schema);
  }

  /**
   * Get the static schema (bundled with app)
   * This would import the generated SQL file from backend
   */
  private async getStaticSchema(): Promise<string> {
    // TODO: Import generated schema
    // import mobileSchema from '../../../backend/docs/mobile-schema.sql';
    // return mobileSchema;
    
    // For now, return a minimal schema for development
    return this.getMinimalSchema();
  }

  /**
   * Minimal schema for development/testing
   */
  private getMinimalSchema(): string {
    return `
      -- Patterns Table
      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        file_path TEXT,
        thumbnail_path TEXT,
        file_storage_id TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        is_favorite INTEGER NOT NULL DEFAULT 0,
        fabric_width REAL,
        fabric_length REAL,
        fabric_type TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        localUpdatedAt TEXT,
        syncedAt TEXT,
        isDeleted INTEGER DEFAULT 0
      );

      -- Tags Table
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color_hex TEXT NOT NULL,
        tag_category_id TEXT NOT NULL,
        createdAt TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        localUpdatedAt TEXT,
        syncedAt TEXT,
        isDeleted INTEGER DEFAULT 0
      );

      -- Tag Categories Table
      CREATE TABLE IF NOT EXISTS tag_categories (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        icon TEXT,
        display_order INTEGER DEFAULT 0,
        is_system_default INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        localUpdatedAt TEXT,
        syncedAt TEXT,
        isDeleted INTEGER DEFAULT 0
      );

      -- Pattern-Tag Junction Table
      CREATE TABLE IF NOT EXISTS pattern_tags (
        pattern_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        createdAt TEXT,
        PRIMARY KEY (pattern_id, tag_id)
      );

      -- Measurement Types Table
      CREATE TABLE IF NOT EXISTS measurement_types (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        unit TEXT NOT NULL DEFAULT 'cm',
        category TEXT NOT NULL DEFAULT 'custom',
        is_system_default INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        localUpdatedAt TEXT,
        syncedAt TEXT,
        isDeleted INTEGER DEFAULT 0
      );

      -- Pattern Measurements Table
      CREATE TABLE IF NOT EXISTS pattern_measurements (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        measurement_type_id TEXT NOT NULL,
        value REAL NOT NULL,
        notes TEXT,
        is_required INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        localUpdatedAt TEXT,
        syncedAt TEXT,
        isDeleted INTEGER DEFAULT 0
      );

      -- Pattern Notes Table
      CREATE TABLE IF NOT EXISTS pattern_notes (
        id TEXT PRIMARY KEY,
        pattern_id TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt TEXT,
        updatedAt TEXT,
        syncStatus TEXT DEFAULT 'pending',
        localUpdatedAt TEXT,
        syncedAt TEXT,
        isDeleted INTEGER DEFAULT 0
      );

      -- Sync Queue Table
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        lastAttemptAt TEXT,
        error TEXT
      );

      -- File Storage Cache Table
      CREATE TABLE IF NOT EXISTS file_storage_cache (
        id TEXT PRIMARY KEY,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        fileType TEXT NOT NULL,
        localPath TEXT NOT NULL,
        remoteUrl TEXT,
        fileSize INTEGER,
        mimeType TEXT,
        downloadedAt TEXT,
        syncStatus TEXT DEFAULT 'pending'
      );

      -- Indices for Performance
      CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_syncStatus ON patterns(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_patterns_isDeleted ON patterns(isDeleted);
      CREATE INDEX IF NOT EXISTS idx_tags_tag_category_id ON tags(tag_category_id);
      CREATE INDEX IF NOT EXISTS idx_tags_syncStatus ON tags(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_measurement_types_user_id ON measurement_types(user_id);
      CREATE INDEX IF NOT EXISTS idx_measurement_types_isSystemDefault ON measurement_types(is_system_default);
      CREATE INDEX IF NOT EXISTS idx_pattern_measurements_pattern_id ON pattern_measurements(pattern_id);
      CREATE INDEX IF NOT EXISTS idx_pattern_measurements_measurement_type_id ON pattern_measurements(measurement_type_id);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entityType ON sync_queue(entityType);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_entityId ON sync_queue(entityId);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_action ON sync_queue(action);
    `;
  }

  /**
   * Fetch schema from backend API (for dynamic updates)
   */
  private async fetchSchemaFromAPI(): Promise<any> {
    // TODO: Implement API fetch
    // const response = await fetch('/api/schema/mobile');
    // return await response.json();
    throw new Error('API schema fetching not implemented yet');
  }

  /**
   * Apply schema from JSON structure
   */
  private async applySchemaFromJSON(schema: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // TODO: Parse JSON schema and generate CREATE TABLE statements
    // This would iterate through schema.tables and build SQL dynamically
    throw new Error('JSON schema application not implemented yet');
  }

  /**
   * Get the currently applied schema version from local storage
   */
  private async getCurrentSchemaVersion(): Promise<string | null> {
    try {
      const versionData = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
      if (!versionData) return null;
      
      const version: SchemaVersion = JSON.parse(versionData);
      return version.version;
    } catch (error) {
      console.error('Error reading schema version:', error);
      return null;
    }
  }

  /**
   * Get the required schema version (from backend or bundled)
   */
  private async getRequiredSchemaVersion(): Promise<string> {
    // TODO: Get version from generated schema
    // For now, use hardcoded version
    return '1.0.0';
  }

  /**
   * Save the applied schema version
   */
  private async saveSchemaVersion(version: string): Promise<void> {
    const versionData: SchemaVersion = {
      version,
      appliedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, JSON.stringify(versionData));
  }

  /**
   * Check if database needs migration
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentSchemaVersion();
    const requiredVersion = await this.getRequiredSchemaVersion();
    return currentVersion !== requiredVersion;
  }

  /**
   * Reset database (dangerous - only for development)
   */
  async resetDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Drop all tables
    await this.db.execAsync(`
      DROP TABLE IF EXISTS patterns;
      DROP TABLE IF EXISTS tags;
      DROP TABLE IF EXISTS tag_categories;
      DROP TABLE IF EXISTS pattern_tags;
      DROP TABLE IF EXISTS measurement_types;
      DROP TABLE IF EXISTS pattern_measurements;
      DROP TABLE IF EXISTS pattern_notes;
      DROP TABLE IF EXISTS sync_queue;
      DROP TABLE IF EXISTS file_storage_cache;
    `);
    
    // Clear version
    await AsyncStorage.removeItem(SCHEMA_VERSION_KEY);
    
    // Reapply schema
    await this.applySchema();
    await this.saveSchemaVersion(await this.getRequiredSchemaVersion());
  }
}

// Export singleton instance
export const schemaManager = new SchemaManager();

// Convenience function for app initialization
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await schemaManager.initDatabase();
};
