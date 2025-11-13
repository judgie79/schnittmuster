import { Express, Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

export function setupErrorHandler(app: Express): void {
  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route nicht gefunden",
      code: "NOT_FOUND",
    });
  });

  // Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message}`, err);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        code: err.code,
        details: err instanceof AppError && "details" in err ? (err as any).details : undefined,
      });
    }

    // Database errors
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Eintrag existiert bereits",
        code: "DUPLICATE_ENTRY",
      });
    }

    // Default error
    res.status(500).json({
      success: false,
      message: "Interner Serverfehler",
      code: "INTERNAL_ERROR",
    });
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
