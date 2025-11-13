import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { environment } from "../config/environment";
import { UnauthorizedError } from "../utils/errors";
import { IJwtPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError();
    }

    const decoded = jwt.verify(token, environment.jwt.secret) as IJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Ungültiger Token"));
    } else {
      next(error);
    }
  }
};
