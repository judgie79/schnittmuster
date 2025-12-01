import { Request, Response, NextFunction } from "express";
import DOMPurify from "isomorphic-dompurify";

export function sanitizeMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      const value = req.body[key];
      if (typeof value === "string") {
        req.body[key] = DOMPurify.sanitize(value);
      }
    });
  }
  next();
}
