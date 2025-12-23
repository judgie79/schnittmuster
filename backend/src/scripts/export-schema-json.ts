#!/usr/bin/env ts-node
/**
 * Schema JSON Exporter
 * 
 * Exports the backend Sequelize model structure as JSON
 * that can be consumed by the mobile app to dynamically
 * create and maintain the SQLite schema.
 */

import { models } from '../infrastructure/database/models';
import { DataTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

interface SchemaField {
  name: string;
  dbColumnName: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: any;
  enumValues?: string[];
  validation?: Record<string, any>;
}

interface TableSchema {
  tableName: string;
  modelName: string;
  fields: SchemaField[];
  indices?: string[];
  timestamps: boolean;
}

interface SchemaExport {
  version: string;
  generatedAt: string;
  tables: Record<string, TableSchema>;
  junctionTables: Array<{
    tableName: string;
    fields: string[];
  }>;
}

class SchemaExporter {
  private mapSequelizeType(sequelizeType: any): { type: string; enumValues?: string[] } {
    const typeKey = sequelizeType.key || sequelizeType.constructor.name;
    
    if (typeKey === 'ENUM' && sequelizeType.values) {
      return { type: 'ENUM', enumValues: sequelizeType.values };
    }

    const typeMap: Record<string, string> = {
      UUID: 'UUID',
      STRING: 'STRING',
      TEXT: 'TEXT',
      INTEGER: 'INTEGER',
      BOOLEAN: 'BOOLEAN',
      DECIMAL: 'DECIMAL',
      FLOAT: 'FLOAT',
      DOUBLE: 'DOUBLE',
      DATE: 'DATE',
      DATEONLY: 'DATEONLY',
      JSON: 'JSON',
      JSONB: 'JSON',
    };

    return { type: typeMap[typeKey] || 'TEXT' };
  }

  private extractTableSchema(modelName: string, model: any): TableSchema {
    const attributes = model.rawAttributes;
    const fields: SchemaField[] = [];

    for (const [fieldName, field] of Object.entries(attributes) as any) {
      const typeInfo = this.mapSequelizeType(field.type);
      
      const schemaField: SchemaField = {
        name: fieldName,
        dbColumnName: field.field || fieldName,
        type: typeInfo.type,
        nullable: field.allowNull !== false,
        primaryKey: field.primaryKey || false,
        defaultValue: field.defaultValue,
        enumValues: typeInfo.enumValues,
        validation: field.validate,
      };

      fields.push(schemaField);
    }

    return {
      tableName: model.tableName,
      modelName,
      fields,
      timestamps: true,
    };
  }

  public exportSchema(): SchemaExport {
    const tables: Record<string, TableSchema> = {};

    // Export main entity tables
    const entitiesToExport = [
      'Pattern',
      'Tag',
      'TagCategory',
      'MeasurementType',
      'PatternMeasurement',
      'PatternNote',
    ];

    for (const entityName of entitiesToExport) {
      if ((models as any)[entityName]) {
        tables[entityName] = this.extractTableSchema(entityName, (models as any)[entityName]);
      }
    }

    // Define junction tables
    const junctionTables = [
      {
        tableName: 'pattern_tags',
        fields: ['pattern_id', 'tag_id'],
      },
    ];

    const schemaExport: SchemaExport = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      tables,
      junctionTables,
    };

    return schemaExport;
  }

  public saveToFile(outputPath: string): void {
    const schema = this.exportSchema();
    const json = JSON.stringify(schema, null, 2);
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, json, 'utf-8');
    console.log(`✅ Schema exported to: ${outputPath}`);
  }
}

// Main execution
if (require.main === module) {
  const exporter = new SchemaExporter();
  
  // Export to JSON file
  const outputPath = path.join(__dirname, '../../docs/mobile-schema.json');
  exporter.saveToFile(outputPath);
  
  // Also output to console for verification
  console.log('\n📋 Schema Preview:');
  console.log(JSON.stringify(exporter.exportSchema(), null, 2));
}

export { SchemaExporter };
