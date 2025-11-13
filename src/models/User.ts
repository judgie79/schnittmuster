import { db } from "../config/database";
import { IUser, IUserCreateInput } from "../types";

export class User {
  static async create(data: IUserCreateInput & { password_hash: string }): Promise<IUser> {
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, username, email, password_hash, created_at, updated_at`,
      [data.username, data.email, data.password_hash]
    );
    return result.rows[0];
  }

  static async findById(id: number): Promise<IUser | null> {
    const result = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<IUser | null> {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return result.rows[0] || null;
  }

  static async update(id: number, data: Partial<IUser>): Promise<IUser> {
    const result = await db.query(
      `UPDATE users SET 
        username = COALESCE($2, username),
        email = COALESCE($3, email),
        updated_at = NOW()
       WHERE id = $1
       RETURNING id, username, email, created_at, updated_at`,
      [id, data.username, data.email]
    );
    return result.rows[0];
  }

  static async delete(id: number): Promise<void> {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
  }
}
