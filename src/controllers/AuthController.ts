import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { asyncHandler } from "../middleware/errorHandler";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const result = await AuthService.register({ username, email, password });

    res.status(201).json({
      success: true,
      message: "Benutzerkonto erfolgreich erstellt",
      data: result,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      message: "Anmeldung erfolgreich",
      data: result,
    });
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    res.json({
      success: true,
      data: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
      },
    });
  });
}
