import { Pool, PoolClient } from "pg";
import { environment } from "./environment";
import logger from "../utils/logger";

export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: environment.database.host,
      port: environment.database.port,
      user: environment.database.user,
      password: environment.database.password,
      database: environment.database.database,
      min: environment.database.poolMin,
      max: environment.database.poolMax,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on("error", (err) => {
      logger.error("Unerwarteter Fehler im Pool:", err);
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      logger.info("Datenbankverbindung erfolgreich");
      client.release();
    } catch (error) {
      logger.error("Fehler beim Verbinden mit Datenbank:", error);
      throw error;
    }
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(text: string, values?: any[]): Promise<any> {
    return this.pool.query(text, values);
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info("Datenbankverbindung geschlossen");
  }
}

export const db = Database.getInstance();
