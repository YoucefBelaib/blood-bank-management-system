import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertDonorSchema,
  insertBloodRequestSchema,
  insertUserSchema,
  insertHospitalSchema,
  updateStatusSchema,
  hospitalLoginSchema,
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/statistics", async (_req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(
        stats || { activeDonors: 0, totalBloodUnits: 0, partnerHospitals: 0 }
      );
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/dashboard-stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
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
          message: fromZodError(result.error).toString(),
        });
      }

      const donor = await storage.createDonor(result.data);
      res.status(201).json(donor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/donors", async (_req, res) => {
    try {
      const donors = await storage.getAllDonors();
      res.json(donors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/donors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Invalid donor id" });
      }

      const deleted = await storage.deleteDonor(id);
      if (!deleted) {
        return res.status(404).json({ message: "Donor not found" });
      }

      return res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blood-requests", async (req, res) => {
    try {
      const result = insertBloodRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromZodError(result.error).toString(),
        });
      }

      const request = await storage.createBloodRequest(result.data);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blood-requests", async (_req, res) => {
    try {
      const requests = await storage.getBloodRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/blood-requests/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateStatusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromZodError(result.error).toString(),
        });
      }

      const request = await storage.updateBloodRequestStatus(
        id,
        result.data.status
      );
      if (!request) {
        return res.status(404).json({ message: "Blood request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Hospital routes
  app.get("/api/hospitals", async (_req, res) => {
    try {
      const hospitals = await storage.getAllHospitals();
      res.json(hospitals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hospitals", async (req, res) => {
    try {
      const result = insertHospitalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromZodError(result.error).toString(),
        });
      }

      // Hash password if provided
      let hospitalData = { ...result.data };
      if (hospitalData.password) {
        const salt = crypto.randomBytes(16).toString("hex");
        const derived = crypto
          .scryptSync(hospitalData.password, salt, 64)
          .toString("hex");
        hospitalData.password = `${salt}:${derived}`;
      }

      const hospital = await storage.createHospital(hospitalData);
      res.status(201).json(hospital);
    } catch (error: any) {
      if (
        error.message?.includes("duplicate key") ||
        error.message?.includes("unique constraint")
      ) {
        return res
          .status(400)
          .json({ message: "A hospital with this email already exists" });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const hospital = await storage.getHospital(id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/hospitals/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const result = updateStatusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: fromZodError(result.error).toString(),
        });
      }

      const hospital = await storage.updateHospitalStatus(
        id,
        result.data.status
      );
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .json({ message: fromZodError(result.error).toString() });
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

      return res
        .status(201)
        .json({ user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password)
        return res.status(400).json({ message: "Missing credentials" });

      const user = await storage.getUserByUsername(username);
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const [salt, hash] = (user.password || "").split(":");
      if (!salt || !hash)
        return res.status(401).json({ message: "Invalid credentials" });

      const derived = crypto.scryptSync(password, salt, 64).toString("hex");
      if (
        !crypto.timingSafeEqual(
          Buffer.from(derived, "hex"),
          Buffer.from(hash, "hex")
        )
      ) {
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
      if (!userId)
        return res.status(401).json({ message: "Not authenticated" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(401).json({ message: "Not authenticated" });

      return res.json({ user: { id: user.id, username: user.username } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Hospital Authentication Routes
  app.post("/api/hospital/auth/login", async (req, res) => {
    try {
      const result = hospitalLoginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid credentials format" });
      }

      const { email, password } = result.data;
      const hospital = await storage.getHospitalByEmail(email);

      if (!hospital) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (hospital.status !== "approved") {
        return res
          .status(403)
          .json({ message: "Hospital account is not approved yet" });
      }

      if (!hospital.password) {
        return res
          .status(401)
          .json({ message: "Password not set for this hospital" });
      }

      const [salt, hash] = hospital.password.split(":");
      if (!salt || !hash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const derived = crypto.scryptSync(password, salt, 64).toString("hex");
      if (
        !crypto.timingSafeEqual(
          Buffer.from(derived, "hex"),
          Buffer.from(hash, "hex")
        )
      ) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req as any).session.hospitalId = hospital.id;

      return res.json({
        hospital: {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          location: hospital.location,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hospital/auth/logout", async (req, res) => {
    try {
      (req as any).session.hospitalId = null;
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hospital/auth/me", async (req, res) => {
    try {
      const hospitalId = (req as any).session?.hospitalId;
      if (!hospitalId)
        return res.status(401).json({ message: "Not authenticated" });

      const hospital = await storage.getHospital(hospitalId);
      if (!hospital)
        return res.status(401).json({ message: "Not authenticated" });

      return res.json({
        hospital: {
          id: hospital.id,
          name: hospital.name,
          email: hospital.email,
          location: hospital.location,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hospital/requests", async (req, res) => {
    try {
      const hospitalId = (req as any).session?.hospitalId;
      if (!hospitalId)
        return res.status(401).json({ message: "Not authenticated" });

      const requests = await storage.getBloodRequestsByHospitalId(hospitalId);
      return res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/hospital/requests", async (req, res) => {
    try {
      const hospitalId = (req as any).session?.hospitalId;
      if (!hospitalId)
        return res.status(401).json({ message: "Not authenticated" });

      const {
        bloodType,
        unitsNeeded,
        urgencyLevel,
        location,
        phone,
        email,
        hospitalName,
      } = req.body;

      if (
        !bloodType ||
        !unitsNeeded ||
        !urgencyLevel ||
        !location ||
        !phone ||
        !email ||
        !hospitalName
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const request = await storage.createBloodRequest({
        hospitalId,
        hospitalName,
        bloodType,
        unitsNeeded: parseInt(unitsNeeded, 10),
        urgencyLevel,
        location,
        phone,
        email,
      });

      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
