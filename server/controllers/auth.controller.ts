import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    const result = await this.authService.login(username, password);

    req.session.userId = result.sessionUserId;
    res.json(result.user);
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;
    const result = await this.authService.signup(username, password);

    res.status(201).json({
      user: result.user,
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

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getCurrentUser(req.session.userId);

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    res.json(user);
  };

  getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    const admins = await this.authService.getAllAdmins();
    res.json(admins);
  };

  approveAdmin = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.authService.approveAdmin(id);
    res.json(user);
  };

  // Password Reset endpoints
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.body;
    const result = await this.authService.requestPasswordReset(username);
    res.json(result);
  };

  validateResetToken = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;
    const result = await this.authService.validateResetToken(token as string);
    res.json(result);
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    const result = await this.authService.resetPassword(token, newPassword);
    res.json(result);
  };
}
