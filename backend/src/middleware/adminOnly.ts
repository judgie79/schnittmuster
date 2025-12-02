import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthenticatedRequest } from "@middleware/auth";
import { ForbiddenError } from "@shared/errors";
import { AdminUserRepository } from "@infrastructure/database/repositories/AdminUserRepository";

const adminUserRepository = new AdminUserRepository();

export const requireAdmin: RequestHandler = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const request = req as AuthenticatedRequest;
  if (!request.user?.id) {
    next(new ForbiddenError("Authentication required"));
    return;
  }

  try {
    const role = await adminUserRepository.getAdminRole(request.user.id);
    if (!role) {
      next(new ForbiddenError("Admin privileges required"));
      return;
    }
    request.user.adminRole = role;
    next();
  } catch (error) {
    next(error);
  }
};
