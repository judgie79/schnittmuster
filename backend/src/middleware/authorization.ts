import { NextFunction, Request, RequestHandler, Response } from "express";
import { AccessRight, ResourceType, UserRole } from "@schnittmuster/dtos";
import { ForbiddenError, NotFoundError } from "@shared/errors";
import { RoleService } from "@features/access-control/RoleService";
import { AccessControlService } from "@features/access-control/AccessControlService";
import { AuthenticatedRequest } from "./auth";
import { AdminUserRepository } from "@infrastructure/database/repositories/AdminUserRepository";

const roleService = new RoleService();
const accessControlService = new AccessControlService();

type AuthorizeOptions = {
  roles?: Array<UserRole | string>;
  resourceIdParam?: string;
  resourceIdGetter?: (req: AuthenticatedRequest) => string | undefined;
  rights?: AccessRight[];
  allowOwner?: boolean;
  resourceType?: ResourceType;
  resourceOwnerResolver?: (req: AuthenticatedRequest) => Promise<string | undefined>;
};

const resolveResourceId = (req: AuthenticatedRequest, options: AuthorizeOptions): string | undefined => {
  if (options.resourceIdGetter) {
    return options.resourceIdGetter(req);
  }
  if (options.resourceIdParam) {
    return req.params?.[options.resourceIdParam];
  }
  return undefined;
};


export const authorize = (options: AuthorizeOptions = {}): RequestHandler => {
  const { roles = [], rights = [], allowOwner = true } = options;
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const request = req as AuthenticatedRequest;
    const userId = request.user?.id;
    if (!userId) {
      next(new ForbiddenError("Authentication required"));
      return;
    }

    try {
      if (roles.length) {
        const hasRole = await roleService.userHasRole(userId, roles);
        if (!hasRole) {
          const adminUserRepository = new AdminUserRepository();
          const role = await adminUserRepository.getAdminRole(userId);
          if (!role) { 
            throw new ForbiddenError("Insufficient role permissions");
          }
          next();
          return;
        }
      }

      if (rights.length) {
        const resourceId = resolveResourceId(request, options);
        if (!resourceId) {
          throw new ForbiddenError("Resource identifier missing");
        }
        try {
          await accessControlService.assertHasRights(userId, resourceId, rights, allowOwner);
        } catch (error) {
          if (
            error instanceof NotFoundError &&
            options.resourceType &&
            options.resourceOwnerResolver
          ) {
            const ownerId = await options.resourceOwnerResolver(request);
            if (!ownerId) {
              throw error;
            }
            await accessControlService.createResource({
              id: resourceId,
              type: options.resourceType,
              ownerId,
              referenceId: resourceId,
            });
            await accessControlService.assertHasRights(userId, resourceId, rights, allowOwner);
          } else {
            throw error;
          }
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
