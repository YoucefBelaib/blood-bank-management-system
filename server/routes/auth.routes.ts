import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth, requireAdmin } from "../middleware";
import asyncHandler from "express-async-handler";

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post("/login", asyncHandler(authController.login));
  router.post("/signup", asyncHandler(authController.signup));
  router.post("/logout", asyncHandler(authController.logout));
  router.get("/user", asyncHandler(authController.getCurrentUser));

  // Admin management routes
  router.get(
    "/admin/users",
    asyncHandler(requireAdmin),
    asyncHandler(authController.getAllAdmins)
  );
  router.patch(
    "/admin/users/:id/approve",
    asyncHandler(requireAdmin),
    asyncHandler(authController.approveAdmin)
  );

  return router;
}
