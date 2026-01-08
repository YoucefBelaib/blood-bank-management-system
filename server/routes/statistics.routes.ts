import { Router } from "express";
import { StatisticsController } from "../controllers/statistics.controller";
import asyncHandler from "express-async-handler";

export function createStatisticsRoutes(
  statisticsController: StatisticsController
): Router {
  const router = Router();

  router.get("/", asyncHandler(statisticsController.getStatistics));
  router.get(
    "/dashboard",
    asyncHandler(statisticsController.getDashboardStats)
  );
  router.get(
    "/inventory",
    asyncHandler(statisticsController.getBloodInventory)
  );

  return router;
}
