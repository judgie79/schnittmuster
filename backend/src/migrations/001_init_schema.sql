-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tag Categories Table
CREATE TABLE IF NOT EXISTS tag_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tag_category_id INTEGER NOT NULL REFERENCES tag_categories(id) ON DELETE CASCADE,
    color_hex VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tag_category_id, name)
);

-- Patterns Table
CREATE TABLE IF NOT EXISTS patterns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    thumbnail_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Pattern Tags Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS pattern_tags (
    pattern_id INTEGER NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pattern_id, tag_id)
);

-- Pattern Notes Table
CREATE TABLE IF NOT EXISTS pattern_notes (
    id SERIAL PRIMARY KEY,
    pattern_id INTEGER NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes für Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_created_at ON patterns(created_at);
CREATE INDEX idx_tags_category ON tags(tag_category_id);
CREATE INDEX idx_pattern_tags_tag ON pattern_tags(tag_id);
CREATE INDEX idx_pattern_tags_pattern ON pattern_tags(pattern_id);
CREATE INDEX idx_pattern_notes_pattern ON pattern_notes(pattern_id);

-- Seed Tag Categories
INSERT INTO tag_categories (id, name, description, display_order) VALUES
(1, 'Zielgruppe', 'Wer trägt das Schnittmuster?', 1),
(2, 'Kleidungsart', 'Was wird daraus genäht?', 2),
(3, 'Hersteller', 'Von wem kommt das Schnittmuster?', 3),
(4, 'Lizenz', 'Rechtliche Nutzung', 4),
(5, 'Größe', 'Für welche Größen ist es?', 5),
(6, 'Status', 'Fortschritt und Status', 6)
ON CONFLICT DO NOTHING;

-- Seed Tags
INSERT INTO tags (name, tag_category_id, color_hex) VALUES
-- Zielgruppe
('Herren', 1, '#FF6B6B'),
('Damen', 1, '#FF6B6B'),
('Jungs', 1, '#FF6B6B'),
('Mädels', 1, '#FF6B6B'),
('Universal', 1, '#FF6B6B'),
-- Kleidungsart
('Shirt', 2, '#4ECDC4'),
('Sweatshirt', 2, '#4ECDC4'),
('Pulli', 2, '#4ECDC4'),
('Kleid', 2, '#4ECDC4'),
('Rock', 2, '#4ECDC4'),
('Hose', 2, '#4ECDC4'),
('Jacke', 2, '#4ECDC4'),
('Accessoire', 2, '#4ECDC4'),
('Tasche', 2, '#4ECDC4'),
('Sonstiges', 2, '#4ECDC4'),
-- Hersteller
('Pattydoo', 3, '#45B7D1'),
('Makerist', 3, '#45B7D1'),
('Eigenentwurf', 3, '#45B7D1'),
('Unbekannt', 3, '#45B7D1'),
-- Lizenz
('Freebook', 4, '#F9CA24'),
('Kaufmuster', 4, '#F9CA24'),
('Lizenzfrei', 4, '#F9CA24'),
('Kommerziell', 4, '#F9CA24'),
-- Größe
('XS', 5, '#6C5CE7'),
('S', 5, '#6C5CE7'),
('M', 5, '#6C5CE7'),
('L', 5, '#6C5CE7'),
('XL', 5, '#6C5CE7'),
('XXL', 5, '#6C5CE7'),
('92-122', 5, '#6C5CE7'),
('122-146', 5, '#6C5CE7'),
('34-46', 5, '#6C5CE7'),
('46-52', 5, '#6C5CE7'),
('Onesize', 5, '#6C5CE7'),
-- Status
('Favorit', 6, '#A29BFE'),
('Ausgedruckt', 6, '#A29BFE'),
('Genäht', 6, '#A29BFE'),
('Getestet', 6, '#A29BFE'),
('Archiviert', 6, '#A29BFE'),
('Verbesserungsbedarf', 6, '#A29BFE')
ON CONFLICT DO NOTHING;
