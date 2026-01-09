import { Router } from "express";
import { HospitalController } from "../controllers/hospital.controller";
import { requireAuth, requireHospitalAuth } from "../middleware";
import asyncHandler from "express-async-handler";

export function createHospitalRoutes(
  hospitalController: HospitalController
): Router {
  const router = Router();

  // Hospital Auth (must be before /:id to avoid matching "auth" as id)
  router.post("/auth/login", asyncHandler(hospitalController.login));
  router.post("/auth/signup", asyncHandler(hospitalController.signup));
  router.post("/auth/logout", asyncHandler(hospitalController.logout));
  router.get("/auth/me", asyncHandler(hospitalController.getCurrentHospital));

  // Password Reset (public endpoints - no auth required)
  router.post(
    "/auth/forgot-password",
    asyncHandler(hospitalController.forgotPassword)
  );
  router.get(
    "/auth/validate-reset-token",
    asyncHandler(hospitalController.validateResetToken)
  );
  router.post(
    "/auth/reset-password",
    asyncHandler(hospitalController.resetPassword)
  );

  // Blood Requests (must be before /:id to avoid matching "requests" as id)
  router.get(
    "/requests/all",
    asyncHandler(hospitalController.getAllBloodRequests)
  );
  router.post(
    "/requests/public",
    asyncHandler(hospitalController.createPublicBloodRequest)
  );
  router.get(
    "/requests",
    requireHospitalAuth,
    asyncHandler(hospitalController.getHospitalBloodRequests)
  );
  router.post(
    "/requests",
    requireHospitalAuth,
    asyncHandler(hospitalController.createBloodRequest)
  );
  router.patch(
    "/requests/:id/status",
    requireAuth,
    asyncHandler(hospitalController.updateBloodRequestStatus)
  );

  // Hospital CRUD (parameterized routes last)
  router.get("/", asyncHandler(hospitalController.getAll));
  router.get("/:id", asyncHandler(hospitalController.getById));
  router.patch(
    "/:id/status",
    requireAuth,
    asyncHandler(hospitalController.updateStatus)
  );

  return router;
}
