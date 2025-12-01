import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { environment } from "@config/environment";
import { connectDatabase, closeDatabase } from "@config/database";
import logger from "@shared/utils/logger";
import { setupRoutes } from "./routes";
import { registerErrorHandlers } from "@middleware/errorHandler";
import { validationErrorHandler } from "@middleware/validation";
import { requestLogger } from "@middleware/requestLogger";
import { apiLimiter } from "@middleware/rateLimit";
import { sanitizeMiddleware } from "@middleware/sanitization";
import "@infrastructure/database/models";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: environment.cors.origins }));
app.use(requestLogger);
app.use(apiLimiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(sanitizeMiddleware);

// Setup routes
setupRoutes(app);

// Error handling
app.use(validationErrorHandler);
registerErrorHandlers(app);

// Start server
async function startServer(): Promise<void> {
  let server: ReturnType<Express["listen"]> | null = null;
  try {
    await connectDatabase();
    logger.info("Database connected");

    server = app.listen(environment.port, () => {
      logger.info(`Server running on http://localhost:${environment.port}${environment.apiPrefix}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error as Error);
    process.exit(1);
  }

  const shutdown = async () => {
    logger.info("Shutting down gracefully");
    await closeDatabase();
    server?.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();

export default app;
