-- =============================================
-- Schnittmuster Mobile App - Offline Database Schema
-- Generated from Backend Sequelize Models
-- =============================================

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
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  user_id TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT,
  syncStatus TEXT DEFAULT 'pending',
  localUpdatedAt TEXT,
  syncedAt TEXT,
  isDeleted INTEGER DEFAULT 0
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
  value REAL,
  notes TEXT,
  is_required INTEGER NOT NULL DEFAULT 0,
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
  note_text TEXT NOT NULL,
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

-- Sync Queue Table (for offline changes)
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
CREATE INDEX IF NOT EXISTS idx_measurement_types_isSystemDefault ON measurement_types(isSystemDefault);
CREATE INDEX IF NOT EXISTS idx_pattern_measurements_pattern_id ON pattern_measurements(pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_measurements_measurement_type_id ON pattern_measurements(measurement_type_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entityType ON sync_queue(entityType);
CREATE INDEX IF NOT EXISTS idx_sync_queue_entityId ON sync_queue(entityId);
CREATE INDEX IF NOT EXISTS idx_sync_queue_action ON sync_queue(action);
