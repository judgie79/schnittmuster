import { db } from "../config/database";
import { ITag, ITagCategory } from "../types";

export class Tag {
  static async findAllCategories(): Promise<ITagCategory[]> {
    const result = await db.query(
      "SELECT * FROM tag_categories ORDER BY display_order ASC"
    );
    return result.rows;
  }

  static async findCategoryById(id: number): Promise<ITagCategory | null> {
    const result = await db.query(
      "SELECT * FROM tag_categories WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async findTagsByCategory(categoryId: number): Promise<ITag[]> {
    const result = await db.query(
      `SELECT t.* FROM tags t
       WHERE t.tag_category_id = $1
       ORDER BY t.name ASC`,
      [categoryId]
    );
    return result.rows;
  }

  static async findTagById(id: number): Promise<ITag | null> {
    const result = await db.query(
      "SELECT * FROM tags WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async createTag(categoryId: number, name: string, color?: string): Promise<ITag> {
    const result = await db.query(
      `INSERT INTO tags (tag_category_id, name, color_hex, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, name, tag_category_id, color_hex, created_at`,
      [categoryId, name, color || null]
    );
    return result.rows[0];
  }

  static async deleteTag(id: number): Promise<void> {
    await db.query("DELETE FROM tags WHERE id = $1", [id]);
  }
}
