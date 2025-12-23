#!/usr/bin/env ts-node
/**
 * Schema Generator for Offline SQLite Database
 * 
 * This script extracts Sequelize model definitions from the backend
 * and generates a SQLite schema that can be used by the mobile app
 * for offline sync functionality.
 */

import { DataTypes } from 'sequelize';
import { models } from '../infrastructure/database/models';

interface FieldMapping {
  type: string;
  nullable: boolean;
  defaultValue?: string;
  primaryKey?: boolean;
  unique?: boolean;
}

class SQLiteSchemaGenerator {
  private typeMapping: Record<string, string> = {
    UUID: 'TEXT',
    STRING: 'TEXT',
    TEXT: 'TEXT',
    INTEGER: 'INTEGER',
    BOOLEAN: 'INTEGER',
    DECIMAL: 'REAL',
    FLOAT: 'REAL',
    DOUBLE: 'REAL',
    DATE: 'TEXT',
    DATEONLY: 'TEXT',
    ENUM: 'TEXT',
    JSON: 'TEXT',
    JSONB: 'TEXT',
  };

  private mapSequelizeTypeToSQLite(sequelizeType: any): string {
    const typeKey = sequelizeType.key || sequelizeType.constructor.name;
    return this.typeMapping[typeKey] || 'TEXT';
  }

  private generateFieldDefinition(fieldName: string, field: any): string {
    const sqliteType = this.mapSequelizeTypeToSQLite(field.type);
    const parts: string[] = [fieldName, sqliteType];

    if (field.primaryKey) {
      parts.push('PRIMARY KEY');
    }

    if (field.allowNull === false && !field.primaryKey) {
      parts.push('NOT NULL');
    }

    if (field.defaultValue !== undefined) {
      if (typeof field.defaultValue === 'boolean') {
        parts.push(`DEFAULT ${field.defaultValue ? 1 : 0}`);
      } else if (typeof field.defaultValue === 'number') {
        parts.push(`DEFAULT ${field.defaultValue}`);
      } else if (typeof field.defaultValue === 'string') {
        parts.push(`DEFAULT '${field.defaultValue}'`);
      }
    }

    if (field.unique) {
      parts.push('UNIQUE');
    }

    return parts.join(' ');
  }

  private generateSyncColumns(): string[] {
    return [
      'syncStatus TEXT DEFAULT \'pending\'',
      'localUpdatedAt TEXT',
      'syncedAt TEXT',
      'isDeleted INTEGER DEFAULT 0'
    ];
  }

  public generateTableSchema(modelName: string, model: any): string {
    const tableName = model.tableName;
    const attributes: Record<string, any> = model.rawAttributes;
    const fields: string[] = [];

    // Add regular fields
    for (const [fieldName, field] of Object.entries(attributes)) {
      // Skip timestamp fields if they're auto-managed
      if (fieldName === 'createdAt' || fieldName === 'updatedAt') {
        continue;
      }
      fields.push(this.generateFieldDefinition(field.field || fieldName, field));
    }

    // Add timestamp fields
    fields.push('createdAt TEXT');
    fields.push('updatedAt TEXT');

    // Add sync-specific columns
    fields.push(...this.generateSyncColumns());

    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${fields.join(',\n  ')}\n);`;
    return sql;
  }

  public generateJunctionTableSchema(tableName: string, foreignKeys: string[]): string {
    const fields = [
      ...foreignKeys.map(fk => `${fk} TEXT NOT NULL`),
      'createdAt TEXT',
      `PRIMARY KEY (${foreignKeys.join(', ')})`
    ];

    return `CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${fields.join(',\n  ')}\n);`;
  }

  public generateSyncQueueSchema(): string {
    return `CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  action TEXT NOT NULL,
  payload TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  lastAttemptAt TEXT,
  error TEXT
);`;
  }

  public generateFileStorageSchema(): string {
    return `CREATE TABLE IF NOT EXISTS file_storage_cache (
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
);`;
  }

  public generateIndices(tableName: string, indexColumns: string[]): string[] {
    return indexColumns.map(col => 
      `CREATE INDEX IF NOT EXISTS idx_${tableName}_${col} ON ${tableName}(${col});`
    );
  }

  public generateFullSchema(): string {
    const schemas: string[] = [];

    schemas.push('-- =============================================');
    schemas.push('-- Schnittmuster Mobile App - Offline Database Schema');
    schemas.push('-- Generated from Backend Sequelize Models');
    schemas.push('-- =============================================\n');

    // Main entity tables
    schemas.push('-- Patterns Table');
    schemas.push(this.generateTableSchema('Pattern', models.Pattern));
    schemas.push('');

    schemas.push('-- Tags Table');
    schemas.push(this.generateTableSchema('Tag', models.Tag));
    schemas.push('');

    schemas.push('-- Tag Categories Table');
    schemas.push(this.generateTableSchema('TagCategory', models.TagCategory));
    schemas.push('');

    schemas.push('-- Measurement Types Table');
    schemas.push(this.generateTableSchema('MeasurementType', models.MeasurementType));
    schemas.push('');

    schemas.push('-- Pattern Measurements Table');
    schemas.push(this.generateTableSchema('PatternMeasurement', models.PatternMeasurement));
    schemas.push('');

    schemas.push('-- Pattern Notes Table');
    schemas.push(this.generateTableSchema('PatternNote', models.PatternNote));
    schemas.push('');

    // Junction tables
    schemas.push('-- Pattern-Tag Junction Table');
    schemas.push(this.generateJunctionTableSchema('pattern_tags', ['pattern_id', 'tag_id']));
    schemas.push('');

    // Sync infrastructure tables
    schemas.push('-- Sync Queue Table (for offline changes)');
    schemas.push(this.generateSyncQueueSchema());
    schemas.push('');

    schemas.push('-- File Storage Cache Table');
    schemas.push(this.generateFileStorageSchema());
    schemas.push('');

    // Indices for performance
    schemas.push('-- Indices for Performance');
    schemas.push(...this.generateIndices('patterns', ['user_id', 'syncStatus', 'isDeleted']));
    schemas.push(...this.generateIndices('tags', ['tag_category_id', 'syncStatus']));
    schemas.push(...this.generateIndices('measurement_types', ['user_id', 'isSystemDefault']));
    schemas.push(...this.generateIndices('pattern_measurements', ['pattern_id', 'measurement_type_id']));
    schemas.push(...this.generateIndices('sync_queue', ['entityType', 'entityId', 'action']));

    return schemas.join('\n');
  }
}

// Main execution
const generator = new SQLiteSchemaGenerator();
const schema = generator.generateFullSchema();

// Output to console or file
console.log(schema);

// Export for programmatic use
export { SQLiteSchemaGenerator };
