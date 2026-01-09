import { Request, Response } from "express";
import { HospitalService } from "../services/hospital.service";

export class HospitalController {
  constructor(private hospitalService: HospitalService) {}

  // Hospital CRUD
  getAll = async (req: Request, res: Response): Promise<void> => {
    const hospitals = await this.hospitalService.getAllHospitals();
    res.json(hospitals);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const hospital = await this.hospitalService.getHospitalById(id);
    res.json(hospital);
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const hospital = await this.hospitalService.updateHospitalStatus(
      id,
      status
    );
    res.json(hospital);
  };

  // Hospital Auth
  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this.hospitalService.login(email, password);

    req.session.hospitalId = result.sessionHospitalId;
    res.json(result.hospital);
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.hospitalService.signup(req.body);
    res.status(201).json({
      hospital: result.hospital,
      message: result.message,
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
        return;
      }
      res.json({ message: "Logged out successfully" });
    });
  };

  getCurrentHospital = async (req: Request, res: Response): Promise<void> => {
    const hospital = await this.hospitalService.getCurrentHospital(
      req.session.hospitalId
    );

    if (!hospital) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    res.json(hospital);
  };

  // Blood Requests
  getAllBloodRequests = async (req: Request, res: Response): Promise<void> => {
    const requests = await this.hospitalService.getAllBloodRequests();
    res.json(requests);
  };

  getHospitalBloodRequests = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const hospitalId = req.session.hospitalId;
    if (!hospitalId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const requests = await this.hospitalService.getBloodRequestsByHospital(
      hospitalId
    );
    res.json(requests);
  };

  createBloodRequest = async (req: Request, res: Response): Promise<void> => {
    const hospitalId = req.session.hospitalId;
    if (!hospitalId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const request = await this.hospitalService.createBloodRequest({
      ...req.body,
      hospitalId,
    });
    res.status(201).json(request);
  };

  // Public blood request (no hospital auth required)
  createPublicBloodRequest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const request = await this.hospitalService.createBloodRequest(req.body);
    res.status(201).json(request);
  };

  updateBloodRequestStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const request = await this.hospitalService.updateBloodRequestStatus(
      id,
      status
    );
    res.json(request);
  };
}
