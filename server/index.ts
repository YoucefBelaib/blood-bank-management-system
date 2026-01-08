import dotenv from "dotenv";
// Load root .env first, then server/.env to allow server-specific overrides
dotenv.config({ path: "server/.env" });

import http from "http";
import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { logger } from "./infrastructure/logger/logger";

(async () => {
  // Create Express app with clean architecture
  const app = createApp();

  // Seed database if configured
  if (process.env.DATABASE_URL) {
    try {
      await seedDatabase();
      logger.info("Database seeded successfully");
    } catch (error) {
      logger.warn("Failed to seed database, continuing anyway...");
    }
  }

  // Create HTTP server
  const server = http.createServer(app);

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
    logger.info(`Server running on http://127.0.0.1:${port}`);
  });
})();
