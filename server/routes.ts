import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonorSchema, insertBloodRequestSchema, insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/statistics", async (_req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats || { activeDonors: 0, totalBloodUnits: 0, partnerHospitals: 0 });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blood-inventory", async (_req, res) => {
    try {
      const inventory = await storage.getBloodInventory();
      res.json(inventory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/donors", async (req, res) => {
    try {
      const result = insertDonorSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const donor = await storage.createDonor(result.data);
      res.status(201).json(donor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blood-requests", async (req, res) => {
    try {
      const result = insertBloodRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).toString() 
        });
      }

      const request = await storage.createBloodRequest(result.data);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).toString() });
      }

      const { username, password } = result.data;

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // hash password using scrypt with a random salt
      const salt = crypto.randomBytes(16).toString("hex");
      const derived = crypto.scryptSync(password, salt, 64).toString("hex");
      const stored = `${salt}:${derived}`;

      const user = await storage.createUser({ username, password: stored });

      // create session
      try {
        (req as any).session.userId = user.id;
      } catch {
        // ignore if session not configured
      }

      return res.status(201).json({ user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ message: "Missing credentials" });

      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const [salt, hash] = (user.password || "").split(":");
      if (!salt || !hash) return res.status(401).json({ message: "Invalid credentials" });

      const derived = crypto.scryptSync(password, salt, 64).toString("hex");
      if (!crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(hash, "hex"))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      try {
        (req as any).session.userId = user.id;
      } catch {}

      return res.json({ user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      (req as any).session.destroy?.(() => {});
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(401).json({ message: "Not authenticated" });

      return res.json({ user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
