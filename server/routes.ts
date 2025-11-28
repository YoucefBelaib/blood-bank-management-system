import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonorSchema, insertBloodRequestSchema, loginSchema, signupSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import cookieParser from "cookie-parser";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
        isApproved: boolean;
      };
    }
  }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.authToken;
  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      isApproved: user.isApproved,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
}

function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin" || !req.user.isApproved) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  try {
    await storage.seedInitialAdmin();
  } catch (error) {
    console.log("Could not seed admin - database may not be ready yet");
  }

  function sanitizeUser(user: any) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = signupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).toString() });
      }

      const { username, password, email, role } = result.data;

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(username, password, email, role);
      const session = await storage.createSession(user.id);
      await storage.updateUserLastLogin(user.id);

      res.cookie("authToken", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ user: sanitizeUser(user) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).toString() });
      }

      const { username, password } = result.data;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValid = await storage.validatePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const session = await storage.createSession(user.id);
      await storage.updateUserLastLogin(user.id);

      res.cookie("authToken", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ user: sanitizeUser(user) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = req.cookies?.authToken;
    if (token) {
      await storage.deleteSession(token);
    }
    res.clearCookie("authToken");
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user: sanitizeUser(user) });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/dashboard", authMiddleware, adminMiddleware, async (_req, res) => {
    try {
      const [stats, inventory, donors, requests, users, logs] = await Promise.all([
        storage.getStatistics(),
        storage.getBloodInventory(),
        storage.getDonors(),
        storage.getBloodRequests(),
        storage.getAllUsers(),
        storage.getInventoryLogs(),
      ]);

      const pendingDonors = donors.filter(d => d.status === "pending");
      const pendingAdmins = users.filter(u => u.role === "admin" && !u.isApproved);

      res.json({
        statistics: stats || { activeDonors: 0, totalBloodUnits: 0, partnerHospitals: 0 },
        inventory,
        donors,
        pendingDonors,
        requests,
        users,
        pendingAdmins,
        inventoryLogs: logs.slice(0, 50),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/inventory/:bloodType", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { bloodType } = req.params;
      const { changeAmount, reason } = req.body;

      if (typeof changeAmount !== "number") {
        return res.status(400).json({ message: "changeAmount must be a number" });
      }

      const updated = await storage.updateBloodInventory(bloodType, changeAmount, req.user!.id, reason);
      if (!updated) {
        return res.status(404).json({ message: "Blood type not found" });
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/donors/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const donor = await storage.approveDonor(req.params.id, req.user!.id);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      res.json(donor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/donors/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const donor = await storage.rejectDonor(req.params.id, req.user!.id);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      res.json(donor);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const user = await storage.approveUser(req.params.id, req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/requests/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const request = await storage.approveBloodRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Blood request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/requests/:id/reject", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const request = await storage.rejectBloodRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Blood request not found" });
      }
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/donor/dashboard", authMiddleware, async (req, res) => {
    try {
      const donations = await storage.getDonorsByUserId(req.user!.id);
      res.json({ donations });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

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

  app.get("/api/donors", async (_req, res) => {
    try {
      const donors = await storage.getAllDonors();
      res.json(donors);
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

      const token = req.cookies?.authToken;
      let userId: string | undefined;
      
      if (token) {
        const session = await storage.getSession(token);
        if (session) {
          userId = session.userId;
        }
      }

      const donor = await storage.createDonor(result.data, userId);
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

  const httpServer = createServer(app);

  return httpServer;
}
