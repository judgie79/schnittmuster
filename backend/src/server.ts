import express, { Express } from "express";
import cors, { CorsOptions } from "cors";
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

const allowedOrigins = environment.cors.origins;
logger.info(`CORS allowed origins: ${allowedOrigins.length ? allowedOrigins.join(", ") : "(none)"}`);

const corsOptions: CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      logger.debug("CORS check skipped because request has no origin header");
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      logger.debug(`CORS allowed for origin: ${origin}`);
      return callback(null, true);
    }

    logger.warn(`CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
};

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
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
