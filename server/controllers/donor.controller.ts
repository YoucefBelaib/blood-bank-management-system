import { Request, Response } from "express";
import { DonorService } from "../services/donor.service";

export class DonorController {
  constructor(private donorService: DonorService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const donors = await this.donorService.getAllDonors();
    res.json(donors);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const donor = await this.donorService.getDonorById(id);
    res.json(donor);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const donor = await this.donorService.createDonor(req.body);
    res.status(201).json(donor);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.donorService.deleteDonor(id);
    res.status(204).send();
  };
}
