import { db } from "../config/database";
import { IPattern, IPatternCreateInput, IPatternWithTags } from "../types";

export class Pattern {
  static async create(userId: number, data: IPatternCreateInput): Promise<IPattern> {
    const result = await db.query(
      `INSERT INTO patterns (user_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, user_id, name, description, file_path, thumbnail_path, created_at, updated_at`,
      [userId, data.name, data.description || null]
    );
    return result.rows[0];
  }

  static async findById(id: number, userId: number): Promise<IPattern | null> {
    const result = await db.query(
      "SELECT * FROM patterns WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async findByIdWithTags(id: number, userId: number): Promise<IPatternWithTags | null> {
    const patternResult = await db.query(
      "SELECT * FROM patterns WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (patternResult.rows.length === 0) return null;

    const pattern = patternResult.rows[0];

    // Get tags
    const tagsResult = await db.query(
      `SELECT t.* FROM tags t
       JOIN pattern_tags pt ON t.id = pt.tag_id
       WHERE pt.pattern_id = $1`,
      [id]
    );

    // Get notes
    const notesResult = await db.query(
      "SELECT * FROM pattern_notes WHERE pattern_id = $1 ORDER BY created_at DESC",
      [id]
    );

    return {
      ...pattern,
      tags: tagsResult.rows,
      notes: notesResult.rows,
    };
  }

  static async findAllByUser(userId: number, limit = 50, offset = 0): Promise<IPattern[]> {
    const result = await db.query(
      `SELECT * FROM patterns WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async update(id: number, userId: number, data: Partial<IPattern>): Promise<IPattern> {
    const result = await db.query(
      `UPDATE patterns SET 
        name = COALESCE($3, name),
        description = COALESCE($4, description),
        file_path = COALESCE($5, file_path),
        thumbnail_path = COALESCE($6, thumbnail_path),
        updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, description, file_path, thumbnail_path, created_at, updated_at`,
      [id, userId, data.name, data.description, data.file_path, data.thumbnail_path]
    );
    return result.rows[0];
  }

  static async delete(id: number, userId: number): Promise<void> {
    await db.query("DELETE FROM patterns WHERE id = $1 AND user_id = $2", [id, userId]);
  }

  static async countByUser(userId: number): Promise<number> {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM patterns WHERE user_id = $1",
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}
