import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "@config/auth";
import { ForbiddenError } from "@shared/errors";
import type { AdminRoleType } from "@schnittmuster/dtos";
import { AUTH_COOKIE_NAME } from "@features/auth/constants";

export type AuthenticatedUser = {
  id: string;
  email: string;
  provider: string;
  adminRole?: AdminRoleType | null;
};

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.method === "OPTIONS") {
    next();
    return;
  }
  const request = req as AuthenticatedRequest;
  const authHeader = req.headers.authorization;
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.[AUTH_COOKIE_NAME];

  let token: string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "");
  }
  if (!token && cookieToken) {
    token = cookieToken;
  }
  if (!token) {
    next(new ForbiddenError("Authorization header missing"));
    return;
  }

  try {
    const payload = jwt.verify(token, authConfig.jwt.accessSecret) as jwt.JwtPayload;
    if (!payload.userId || !payload.sub) {
      next(new ForbiddenError("Invalid token payload"));
      return;
    }
    request.user = {
      id: String(payload.userId),
      email: String(payload.sub),
      provider: String(payload.provider ?? "local"),
      adminRole: (payload.adminRole as AdminRoleType | undefined) ?? undefined,
    };
    next();
  } catch {
    next(new ForbiddenError("Invalid token"));
  }
};
