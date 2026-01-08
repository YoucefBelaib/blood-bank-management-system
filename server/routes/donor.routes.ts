import { Router } from "express";
import { DonorController } from "../controllers/donor.controller";
import { requireAuth } from "../middleware";
import asyncHandler from "express-async-handler";

export function createDonorRoutes(donorController: DonorController): Router {
  const router = Router();

  router.get("/", asyncHandler(donorController.getAll));
  router.get("/:id", asyncHandler(donorController.getById));
  router.post(
    "/",
    asyncHandler(requireAuth),
    asyncHandler(donorController.create)
  );
  router.delete(
    "/:id",
    asyncHandler(requireAuth),
    asyncHandler(donorController.delete)
  );

  return router;
}
