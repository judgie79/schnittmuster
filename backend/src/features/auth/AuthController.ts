import { Request, Response } from "express";
import { AuthService } from "./AuthService";
import { asyncHandler } from "@middleware/errorHandler";
import { UserMapper } from "@shared/mappers";
import { AuthenticatedRequest } from "@middleware/auth";
import { ForbiddenError } from "@shared/errors";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { user } = await this.authService.register(req.body);
    res.status(201).json({ success: true, data: { user } });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, tokens } = await this.authService.login(email, password);
    res.json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await this.authService.refresh(refreshToken);
    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  });

  profile = asyncHandler(async (req: Request, res: Response) => {
    const request = req as AuthenticatedRequest;
    if (!request.user?.id) {
      throw new ForbiddenError("Unauthorized");
    }
    const user = await this.authService.getProfile(request.user.id);
    res.json({ success: true, data: { user } });
  });

  handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const tokens = this.authService.generateTokens(user);
    res.json({
      success: true,
      data: {
        user: UserMapper.toDTO(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  });
}

export const authController = new AuthController();
