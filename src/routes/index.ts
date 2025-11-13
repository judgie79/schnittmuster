import { Express } from "express";
import { environment } from "../config/environment";
import authRoutes from "./auth.routes";
import patternsRoutes from "./patterns.routes";
import tagsRoutes from "./tags.routes";

export function setupRoutes(app: Express): void {
  const apiPrefix = environment.apiPrefix;

  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/patterns`, patternsRoutes);
  app.use(`${apiPrefix}/tags`, tagsRoutes);

  // Health check
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({
      success: true,
      message: "Server läuft",
      timestamp: new Date().toISOString(),
    });
  });
}
