import { db } from "../config/database";
import { IPatternTag } from "../types";

export class PatternTag {
  static async addTags(patternId: number, tagIds: number[]): Promise<void> {
    // Remove existing tags first
    await db.query("DELETE FROM pattern_tags WHERE pattern_id = $1", [patternId]);

    // Add new tags
    if (tagIds.length === 0) return;

    const values = tagIds.map((tagId, index) => 
      `($1, $${index + 2}, NOW())`
    ).join(",");

    const query = `INSERT INTO pattern_tags (pattern_id, tag_id, assigned_at)
                   VALUES ${values}`;

    await db.query(query, [patternId, ...tagIds]);
  }

  static async removeTag(patternId: number, tagId: number): Promise<void> {
    await db.query(
      "DELETE FROM pattern_tags WHERE pattern_id = $1 AND tag_id = $2",
      [patternId, tagId]
    );
  }

  static async getPatternTags(patternId: number): Promise<IPatternTag[]> {
    const result = await db.query(
      `SELECT pattern_id, tag_id, assigned_at FROM pattern_tags
       WHERE pattern_id = $1
       ORDER BY assigned_at DESC`,
      [patternId]
    );
    return result.rows;
  }

  static async searchByTags(userId: number, tagIds: number[], operator = "AND"): Promise<any[]> {
    if (tagIds.length === 0) {
      return db.query(
        `SELECT p.* FROM patterns p WHERE p.user_id = $1`,
        [userId]
      ).then(r => r.rows);
    }

    const tagIdList = tagIds.join(",");

    let query: string;
    if (operator === "AND") {
      query = `
        SELECT p.* FROM patterns p
        WHERE p.user_id = $1
        AND p.id IN (
          SELECT pattern_id FROM pattern_tags
          WHERE tag_id = ANY($2)
          GROUP BY pattern_id
          HAVING COUNT(DISTINCT tag_id) = $3
        )
      `;
    } else {
      query = `
        SELECT DISTINCT p.* FROM patterns p
        WHERE p.user_id = $1
        AND p.id IN (
          SELECT pattern_id FROM pattern_tags
          WHERE tag_id = ANY($2)
        )
      `;
    }

    const result = await db.query(query, [userId, tagIds, tagIds.length]);
    return result.rows;
  }
}
