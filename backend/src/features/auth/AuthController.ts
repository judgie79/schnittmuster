import type { CookieOptions, Request, Response } from "express";
import { AuthService, TokenPair } from "./AuthService";
import { asyncHandler } from "@middleware/errorHandler";
import { UserMapper } from "@shared/mappers";
import { AuthenticatedRequest } from "@middleware/auth";
import { ForbiddenError } from "@shared/errors";
import { authConfig } from "@config/auth";
import { environment } from "@config/environment";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from "./constants";
import type { UserDTO } from "@shared/dtos";

const DEFAULT_ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const DEFAULT_REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const durationToMs = (value: string, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const directSeconds = Number(value);
  if (Number.isFinite(directSeconds)) {
    return directSeconds * 1000;
  }
  const match = /^\s*(\d+)\s*([smhd])?\s*$/i.exec(value);
  if (!match) {
    return fallback;
  }
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "s";
  const unitMap: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * (unitMap[unit] ?? 1000);
};

export class AuthController {
  private readonly cookieBaseOptions: CookieOptions;
  private readonly accessCookieMaxAge: number;
  private readonly refreshCookieMaxAge: number;

  constructor(private readonly authService = new AuthService()) {
    this.cookieBaseOptions = {
      httpOnly: true,
      sameSite: environment.nodeEnv === "production" ? "strict" : "lax",
      secure: environment.nodeEnv !== "development",
      path: "/",
    };
    this.accessCookieMaxAge = durationToMs(authConfig.jwt.accessExpiry, DEFAULT_ACCESS_MAX_AGE_MS);
    this.refreshCookieMaxAge = durationToMs(authConfig.jwt.refreshExpiry, DEFAULT_REFRESH_MAX_AGE_MS);
  }

  private setAuthCookies(res: Response, tokens: TokenPair): void {
    res.cookie(AUTH_COOKIE_NAME, tokens.accessToken, {
      ...this.cookieBaseOptions,
      maxAge: this.accessCookieMaxAge,
    });
    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      ...this.cookieBaseOptions,
      maxAge: this.refreshCookieMaxAge,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, { ...this.cookieBaseOptions });
    res.clearCookie(REFRESH_COOKIE_NAME, { ...this.cookieBaseOptions });
  }

  private sendAuthResponse(res: Response, user: UserDTO, tokens: TokenPair, status = 200): void {
    this.setAuthCookies(res, tokens);
    res.status(status).json({
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }

  register = asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await this.authService.register(req.body);
    this.sendAuthResponse(res, user, tokens, 201);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, tokens } = await this.authService.login(email, password);
    this.sendAuthResponse(res, user, tokens);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const requestWithCookies = req as Request & { cookies?: Record<string, string> };
    const refreshToken = req.body?.refreshToken ?? requestWithCookies.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new ForbiddenError("Refresh token required");
    }
    const tokens = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, tokens);
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
    this.setAuthCookies(res, tokens);
    res.json({
      success: true,
      data: {
        user: UserMapper.toDTO(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    this.clearAuthCookies(res);
    res.status(204).send();
  });
}

export const authController = new AuthController();
