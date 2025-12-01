import { Request, Response } from "express";
import { AuthService } from "./AuthService";
import { asyncHandler } from "@middleware/errorHandler";
import { UserMapper } from "@shared/mappers";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await this.authService.register(req.body);
    res.status(201).json({ success: true, data: { user, tokens } });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, tokens } = await this.authService.login(email, password);
    res.json({ success: true, data: { user, tokens } });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await this.authService.refresh(refreshToken);
    res.json({ success: true, data: { tokens } });
  });

  handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const tokens = this.authService.generateTokens(user);
    res.json({ success: true, data: { user: UserMapper.toDTO(user), tokens } });
  });
}

export const authController = new AuthController();
