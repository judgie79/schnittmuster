import { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "@shared/errors";
import logger from "@shared/utils/logger";

export const asyncHandler = (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export function registerErrorHandlers(app: Express): void {
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: "Route not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled error", err as Error);

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        details: err.details,
      });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  });
}
