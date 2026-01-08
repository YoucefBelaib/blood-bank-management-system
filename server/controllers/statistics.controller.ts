import { Request, Response } from "express";
import { StatisticsService } from "../services/statistics.service";

export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  getStatistics = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.statisticsService.getStatistics();
    res.json(stats);
  };

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await this.statisticsService.getDashboardStats();
    res.json(stats);
  };

  getBloodInventory = async (req: Request, res: Response): Promise<void> => {
    const inventory = await this.statisticsService.getBloodInventory();
    res.json(inventory);
  };
}
