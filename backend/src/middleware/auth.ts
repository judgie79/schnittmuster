import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "@config/auth";
import { ForbiddenError } from "@shared/errors";

export type AuthenticatedUser = {
  id: string;
  email: string;
  provider: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export const authenticate: RequestHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const request = req as AuthenticatedRequest;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new ForbiddenError("Authorization header missing"));
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, authConfig.jwt.accessSecret) as jwt.JwtPayload;
    request.user = {
      id: String(payload.userId ?? ""),
      email: String(payload.sub ?? ""),
      provider: String(payload.provider ?? "local"),
    };
    next();
  } catch {
    next(new ForbiddenError("Invalid token"));
  }
};
