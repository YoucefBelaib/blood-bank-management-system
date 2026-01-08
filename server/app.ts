import express, { type Express } from "express";
import { sessionConfig } from "./infrastructure/session/session.config";
import { errorHandler } from "./middleware";
import { logger } from "./infrastructure/logger/logger";
import { container } from "./config/container";
import {
  createAuthRoutes,
  createDonorRoutes,
  createHospitalRoutes,
  createStatisticsRoutes,
} from "./routes";

export function createApp(): Express {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(sessionConfig);

  // Request logging (development)
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        logger.log(logLine);
      }
    });

    next();
  });

  // API routes
  const { controllers } = container;

  app.use("/api", createAuthRoutes(controllers.auth));
  app.use("/api/donors", createDonorRoutes(controllers.donor));
  app.use("/api/hospitals", createHospitalRoutes(controllers.hospital));
  app.use("/api/statistics", createStatisticsRoutes(controllers.statistics));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
