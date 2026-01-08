import { Router } from "express";
import { HospitalController } from "../controllers/hospital.controller";
import { requireAuth, requireHospitalAuth } from "../middleware";
import asyncHandler from "express-async-handler";

export function createHospitalRoutes(
  hospitalController: HospitalController
): Router {
  const router = Router();

  // Hospital CRUD
  router.get("/", asyncHandler(hospitalController.getAll));
  router.get("/:id", asyncHandler(hospitalController.getById));
  router.patch(
    "/:id/status",
    asyncHandler(requireAuth),
    asyncHandler(hospitalController.updateStatus)
  );

  // Hospital Auth
  router.post("/auth/login", asyncHandler(hospitalController.login));
  router.post("/auth/signup", asyncHandler(hospitalController.signup));
  router.post("/auth/logout", asyncHandler(hospitalController.logout));
  router.get("/auth/me", asyncHandler(hospitalController.getCurrentHospital));

  // Blood Requests (all)
  router.get(
    "/requests/all",
    asyncHandler(hospitalController.getAllBloodRequests)
  );

  // Blood Requests (hospital-specific)
  router.get(
    "/requests",
    asyncHandler(requireHospitalAuth),
    asyncHandler(hospitalController.getHospitalBloodRequests)
  );
  router.post(
    "/requests",
    asyncHandler(requireHospitalAuth),
    asyncHandler(hospitalController.createBloodRequest)
  );
  router.patch(
    "/requests/:id/status",
    asyncHandler(requireAuth),
    asyncHandler(hospitalController.updateBloodRequestStatus)
  );

  return router;
}
