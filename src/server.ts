import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { environment } from "./config/environment";
import { db } from "./config/database";
import logger from "./utils/logger";
import { setupRoutes } from "./routes";
import { setupErrorHandler } from "./middleware/errorHandler";
import { validationErrorHandler } from "./middleware/validation";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: environment.cors.origin }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Setup routes
setupRoutes(app);

// Error handling
app.use(validationErrorHandler);
setupErrorHandler(app);

// Start server
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await db.connect();
    logger.info("Datenbank verbunden");

    // Start listening
    app.listen(environment.port, () => {
      logger.info(
        `Server läuft auf http://localhost:${environment.port}${environment.apiPrefix}`
      );
    });
  } catch (error) {
    logger.error("Fehler beim Starten des Servers:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM empfangen, fahre Server herunter...");
  await db.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT empfangen, fahre Server herunter...");
  await db.close();
  process.exit(0);
});

startServer();

export default app;
