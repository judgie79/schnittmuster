import { db } from "../src/config/database";
import fs from "fs";
import path from "path";
import logger from "../src/utils/logger";

async function runMigrations() {
  try {
    const client = await db.getClient();

    try {
      logger.info("Führe Migrationen aus...");

      // Read migration file
      const migrationPath = path.join(__dirname, "../src/migrations/001_init_schema.sql");
      const migration = fs.readFileSync(migrationPath, "utf-8");

      // Execute migration
      await client.query(migration);

      logger.info("Migrationen erfolgreich abgeschlossen");
    } finally {
      client.release();
    }

    await db.close();
  } catch (error) {
    logger.error("Fehler beim Ausführen der Migrationen:", error);
    process.exit(1);
  }
}

runMigrations();
