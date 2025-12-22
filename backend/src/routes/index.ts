import { Express } from "express";
import { environment } from "@config/environment";
import authRoutes from "./auth.routes";
import patternsRoutes from "./patterns.routes";
import tagsRoutes from "./tags.routes";
import adminRoutes from "./admin.routes";
import filesRoutes from "./files.routes";
import measurementRoutes from "@features/measurements/measurement.routes";

export function setupRoutes(app: Express): void {
  const apiPrefix = environment.apiPrefix;

  app.use(`${apiPrefix}/auth`, authRoutes);
  app.use(`${apiPrefix}/patterns`, patternsRoutes);
  app.use(`${apiPrefix}/tags`, tagsRoutes);
  app.use(`${apiPrefix}/admin`, adminRoutes);
  app.use(`${apiPrefix}/files`, filesRoutes);
  app.use(apiPrefix, measurementRoutes);

  // Health check
  app.get(`${apiPrefix}/health`, (req, res) => {
    res.json({
      success: true,
      message: "Server läuft",
      timestamp: new Date().toISOString(),
    });
  });
}
